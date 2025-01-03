;
;
class WalletConnector {
    _activeConnection;
    constructor() {
        this._activeConnection = undefined;
    }
    /**
     * Connect to a browser wallet to enable interactions with the wallet. If the wallet has not
     * already approved the website on which this connection is attempted, the user will be prompted
     * to allow the connection.
     *
     * @param walletId the ID of a CIP30 wallet option as returned from `getAvailableWallets()`
     * @returns true if the CIP30 wallet connection was successful, otherwise false
     */
    async connect(walletId) {
        return await this._enableWallet(walletId);
    }
    /**
     * Get all available wallets in the current browser environment. Every CIP-30 compatible wallet
     * that the user has installed will be represented in the returned array.
     *
     * @returns an array of wallet information required for displaying connection options to a user
     */
    getAvailableWallets() {
        return Object.entries(this._getCIP30Injection()).map(([walletId, walletOption]) => {
            return {
                id: walletId,
                name: walletOption.name,
                icon: walletOption.icon,
            };
        });
    }
    /**
     * Get the stake address of the wallet that currently has
     * an active connection.
     *
     * @param bech32 whether or not the return format should have the standard human-readable bech32 format as opposed to CBOR
     * @returns the stake address for the active wallet
     * @throws Error if there is no active connection or if there is no stake address available
     */
    async getStakeAddress(bech32 = true) {
        this._requireActive();
        const stakeAddresses = await this._activeConnection.api.getRewardAddresses();
        if (stakeAddresses.length < 1)
            throw new Error('There are no stake addresses available');
        const cborPrivateKey = stakeAddresses[0];
        if (!bech32)
            return cborPrivateKey;
        return this._cborToBech32(cborPrivateKey);
    }
    /**
     * Prompt the user to cryptographically sign a message using their connected Cardano wallet. The produced
     * signature can be used for wallet ownership verification as well as specifically confirming that the wallet
     * signed the specific payload data.
     *
     * @param payload an arbitrary payload that will be displayed the the user when signing, and can then be cryptographically validated as signed
     * @returns a message signature that can be used for cryptographic verification of wallet ownership
     * @throws Error if there is no active connection or if signing fails or is rejected
     */
    async signMessage(payload) {
        this._requireActive();
        try {
            return await this._activeConnection.api.signData(await this.getStakeAddress(false), this._hexify(payload));
        }
        catch (err) {
            // err.info is a Nami error field
            throw new Error('Unable to sign message: ' + (err.message ?? err.info));
        }
    }
    async _enableWallet(walletId) {
        this._activeConnection = undefined;
        const cip30 = this._getCIP30Injection();
        if (!cip30)
            return false;
        const wallet = cip30[walletId];
        if (!wallet)
            return false;
        let api = undefined;
        try {
            api = await wallet.enable();
            if (!api)
                throw new Error('Unable to enable wallet');
        }
        catch (err) {
            return false;
        }
        this._activeConnection = {
            api,
            wallet: {
                id: walletId,
                name: wallet.name,
                icon: wallet.icon
            }
        };
        return true;
    }
    _getCIP30Injection() {
        if (window === undefined)
            return {};
        const cardanoInjection = window.cardano;
        if (cardanoInjection === undefined)
            return {};
        return Object.entries(cardanoInjection).filter(([_, walletOption]) => {
            if (!walletOption)
                return false;
            return walletOption.enable !== undefined && typeof walletOption.name === 'string' && typeof walletOption.icon === 'string';
        }).reduce((acc, [walletId, walletOption]) => {
            acc[walletId] = walletOption;
            return acc;
        }, {});
    }
    _requireActive() {
        if (this._activeConnection === undefined)
            throw new Error('There is not active wallet connection');
    }
    _hexify(str) {
        str = decodeURIComponent(encodeURIComponent(str));
        let hexStr = '';
        for (let i = 0; i < str.length; i++) {
            const hex = Number(str.charCodeAt(i)).toString(16);
            hexStr += hex;
        }
        return hexStr;
    }
    _polymodStep(pre) {
        const b = pre >> 25;
        return (((pre & 0x1ffffff) << 5) ^
            (-((b >> 0) & 1) & 0x3b6a57b2) ^
            (-((b >> 1) & 1) & 0x26508e6d) ^
            (-((b >> 2) & 1) & 0x1ea119fa) ^
            (-((b >> 3) & 1) & 0x3d4233dd) ^
            (-((b >> 4) & 1) & 0x2a1462b3));
    }
    _prefixChk(prefix) {
        let chk = 1;
        for (let i = 0; i < prefix.length; ++i) {
            const c = prefix.charCodeAt(i);
            if (c < 33 || c > 126)
                return 'Invalid prefix (' + prefix + ')';
            chk = this._polymodStep(chk) ^ (c >> 5);
        }
        chk = this._polymodStep(chk);
        for (let i = 0; i < prefix.length; ++i) {
            const v = prefix.charCodeAt(i);
            chk = this._polymodStep(chk) ^ (v & 0x1f);
        }
        return chk;
    }
    _cborToBech32(cbor) {
        // Convert cbor to bech32 words
        let value = 0;
        let bits = 0;
        let inBits = 8;
        let outBits = 5;
        let pad = true;
        let data = Uint8Array.from(cbor.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
        const maxV = (1 << outBits) - 1;
        const words = [];
        for (let i = 0; i < data.length; ++i) {
            value = (value << inBits) | data[i];
            bits += inBits;
            while (bits >= outBits) {
                bits -= outBits;
                words.push((value >> bits) & maxV);
            }
        }
        if (pad) {
            if (bits > 0) {
                words.push((value << (outBits - bits)) & maxV);
            }
        }
        else {
            if (bits >= inBits)
                throw new Error('Excess padding');
            if ((value << (outBits - bits)) & maxV)
                throw new Error('Non-zero padding');
        }
        // Encode to bech32
        const limit = 90;
        const prefix = 'stake';
        const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
        if (prefix.length + 7 + words.length > limit)
            throw new TypeError('Exceeds length limit');
        // Determine chk mod
        let chk = this._prefixChk(prefix);
        if (typeof chk === 'string')
            throw new Error(chk);
        let addr = prefix + '1';
        for (let i = 0; i < words.length; ++i) {
            const x = words[i];
            if (x >> 5 !== 0)
                throw new Error('Non 5-bit word');
            chk = this._polymodStep(chk) ^ x;
            addr += ALPHABET.charAt(x);
        }
        for (let i = 0; i < 6; ++i) {
            chk = this._polymodStep(chk);
        }
        chk ^= 1;
        for (let i = 0; i < 6; ++i) {
            const v = (chk >> ((5 - i) * 5)) & 0x1f;
            addr += ALPHABET.charAt(v);
        }
        return addr;
    }
}
// Uncomment this line if using this file as a module
// export default WalletConnector;

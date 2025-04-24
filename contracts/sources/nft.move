module ddc::nft {
    use std::string;

    // Error codes
    const EInvalidAttribute: u64 = 1;

    /// Character attributes bounds
    const MIN_ATTRIBUTE: u64 = 1;
    const MAX_ATTRIBUTE: u64 = 100;
    const DEFAULT_ATTRIBUTE: u64 = 50;

    /// Character NFT with attributes
    public struct GameNFT has key, store {
        id: object::UID,
        name: string::String,
        level: u64,
        strength: u64,
        agility: u64,
        intelligence: u64,
        stamina: u64
    }

    /// Create a new character NFT with given attributes
    public fun mint(
        name: string::String,
        strength: u64,
        agility: u64,
        intelligence: u64,
        stamina: u64,
        ctx: &mut tx_context::TxContext
    ): GameNFT {
        // Validate attributes
        assert!(strength >= MIN_ATTRIBUTE && strength <= MAX_ATTRIBUTE, EInvalidAttribute);
        assert!(agility >= MIN_ATTRIBUTE && agility <= MAX_ATTRIBUTE, EInvalidAttribute);
        assert!(intelligence >= MIN_ATTRIBUTE && intelligence <= MAX_ATTRIBUTE, EInvalidAttribute);
        assert!(stamina >= MIN_ATTRIBUTE && stamina <= MAX_ATTRIBUTE, EInvalidAttribute);

        GameNFT {
            id: object::new(ctx),
            name,
            level: 1,
            strength,
            agility,
            intelligence,
            stamina
        }
    }

    /// Create a default character NFT
    public fun mint_default(
        name: string::String,
        ctx: &mut tx_context::TxContext
    ): GameNFT {
        GameNFT {
            id: object::new(ctx),
            name,
            level: 1,
            strength: DEFAULT_ATTRIBUTE,
            agility: DEFAULT_ATTRIBUTE,
            intelligence: DEFAULT_ATTRIBUTE,
            stamina: DEFAULT_ATTRIBUTE
        }
    }

    // Getters for NFT attributes
    public fun get_strength(nft: &GameNFT): u64 { nft.strength }
    public fun get_agility(nft: &GameNFT): u64 { nft.agility }
    public fun get_intelligence(nft: &GameNFT): u64 { nft.intelligence }
    public fun get_stamina(nft: &GameNFT): u64 { nft.stamina }
    public fun get_level(nft: &GameNFT): u64 { nft.level }
    public fun get_name(nft: &GameNFT): &string::String { &nft.name }

    #[test_only]
    public fun create_test_nft(ctx: &mut tx_context::TxContext): GameNFT {
        mint_default(string::utf8(b"Test Character"), ctx)
    }

    #[test_only]
    public fun init_for_testing(_ctx: &mut tx_context::TxContext) {
        // No initialization needed for NFT module in tests
    }

    #[test_only]
    public fun mint_nft_with_attributes(
        _recipient: address,
        strength: u64,
        agility: u64,
        intelligence: u64,
        stamina: u64,
        ctx: &mut tx_context::TxContext
    ): GameNFT {
        GameNFT {
            id: object::new(ctx),
            name: string::utf8(b"Test Character"),
            level: 1,
            strength,
            agility,
            intelligence,
            stamina
        }
    }

    #[test_only]
    public fun mint_test_nft(ctx: &mut tx_context::TxContext): GameNFT {
        GameNFT {
            id: object::new(ctx),
            name: string::utf8(b"Test NFT"),
            level: 1,
            strength: DEFAULT_ATTRIBUTE,
            agility: DEFAULT_ATTRIBUTE,
            intelligence: DEFAULT_ATTRIBUTE,
            stamina: DEFAULT_ATTRIBUTE
        }
    }
} 
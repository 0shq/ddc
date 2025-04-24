module ddc::token {
    use sui::coin::{Self, Coin, TreasuryCap};

    /// The DDC Game Token type. This is also the one-time witness
    /// for the module (name matches the module name).
    public struct TOKEN has drop {}

    /// Capability that grants permission to mint and burn DDC tokens
    public struct TokenAdmin has key, store {
        id: UID,
        treasury_cap: TreasuryCap<TOKEN>
    }

    /// Initialize the DDC token
    fun init(witness: TOKEN, ctx: &mut TxContext) {
        // Create the DDC currency with 9 decimals
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9,
            b"DDC",
            b"Degen D. Clash",
            b"The native token of the Degen D. Clash game",
            option::none(),
            ctx
        );

        // Register the coin metadata
        transfer::public_freeze_object(metadata);

        // Create and transfer TokenAdmin capability to the sender
        transfer::public_transfer(
            TokenAdmin {
                id: object::new(ctx),
                treasury_cap
            },
            sui::tx_context::sender(ctx)
        );
    }

    /// Mint new DDC tokens
    public fun mint(
        admin: &mut TokenAdmin,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(&mut admin.treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Burn DDC tokens
    public fun burn(
        admin: &mut TokenAdmin,
        coin: Coin<TOKEN>
    ): u64 {
        coin::burn(&mut admin.treasury_cap, coin)
    }

    /// Get the total supply of DDC tokens
    public fun total_supply(admin: &TokenAdmin): u64 {
        coin::total_supply(&admin.treasury_cap)
    }

    // === Test Functions ===
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(TOKEN {}, ctx)
    }

    #[test_only]
    public fun mint_for_testing(
        admin: &mut TokenAdmin,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<TOKEN> {
        coin::mint(&mut admin.treasury_cap, amount, ctx)
    }
} 
module ddc::game {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};

    // Error codes
    const EInsufficientFunds: u64 = 1;

    public struct GAME has drop {}

    public struct AdminCap has key, store {
        id: UID
    }

    public struct GameConfig has key, store {
        id: UID,
        treasury: Balance<SUI>,
        total_mints: u64
    }

    fun init(_witness: GAME, ctx: &mut TxContext) {
        transfer::public_transfer(
            AdminCap { id: object::new(ctx) },
            tx_context::sender(ctx)
        );

        transfer::public_share_object(GameConfig {
            id: object::new(ctx),
            treasury: balance::zero(),
            total_mints: 0
        });
    }

    public fun add_to_treasury(
        config: &mut GameConfig,
        payment: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut config.treasury, payment_balance);
    }

    public fun admin_withdraw(
        _admin_cap: &AdminCap,
        config: &mut GameConfig,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(balance::value(&config.treasury) >= amount, EInsufficientFunds);
        let coin = coin::from_balance(balance::split(&mut config.treasury, amount), ctx);
        transfer::public_transfer(coin, recipient);
    }

    public fun get_treasury_value(config: &GameConfig): u64 {
        balance::value(&config.treasury)
    }

    public fun get_total_mints(config: &GameConfig): u64 {
        config.total_mints
    }

    #[test_only]
    public fun create_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
        AdminCap { id: object::new(ctx) }
    }

    #[test_only]
    public fun create_game_config_for_testing(ctx: &mut TxContext): GameConfig {
        GameConfig {
            id: object::new(ctx),
            treasury: balance::zero(),
            total_mints: 0
        }
    }
}
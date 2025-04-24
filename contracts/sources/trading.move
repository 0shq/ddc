module ddc::trading {
    use sui::table::{Self, Table};
    use sui::event;
    use sui::coin::{Self, Coin};

    use ddc::nft::GameNFT;
    use ddc::token::TOKEN;

    // Error codes
    const E_NOT_OWNER: u64 = 0;
    const E_TRADE_ALREADY_ACCEPTED: u64 = 1;
    const E_INSUFFICIENT_PAYMENT: u64 = 2;

    public struct TradeOffer has store, drop {
        nft_id: ID,
        token_amount: u64,
        from: address,
        to: address,
        is_accepted: bool
    }

    public struct TradingHub has key, store {
        id: UID,
        trades: Table<u64, TradeOffer>,
        total_trades: u64
    }

    // Events
    public struct TradeCreated has copy, drop {
        trade_id: u64,
        nft_id: ID,
        token_amount: u64,
        from: address,
        to: address
    }

    public struct TradeAccepted has copy, drop {
        trade_id: u64,
        nft_id: ID,
        token_amount: u64,
        from: address,
        to: address
    }

    public struct TradeCancelled has copy, drop {
        trade_id: u64,
        nft_id: ID,
        from: address,
        to: address
    }

    fun init(ctx: &mut TxContext) {
        let trading_hub = TradingHub {
            id: object::new(ctx),
            trades: table::new(ctx),
            total_trades: 0
        };
        transfer::public_share_object(trading_hub);
    }

    public fun create_trade(
        hub: &mut TradingHub,
        nft: GameNFT,
        token_amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ): u64 {
        let sender = tx_context::sender(ctx);
        let trade_id = hub.total_trades;

        let trade = TradeOffer {
            nft_id: object::id(&nft),
            token_amount,
            from: sender,
            to: recipient,
            is_accepted: false
        };

        table::add(&mut hub.trades, trade_id, trade);
        hub.total_trades = hub.total_trades + 1;

        event::emit(TradeCreated {
            trade_id,
            nft_id: object::id(&nft),
            token_amount,
            from: sender,
            to: recipient
        });

        // Store NFT in dynamic field
        sui::dynamic_field::add(&mut hub.id, object::id(&nft), nft);
        trade_id
    }

    public fun accept_trade(
        hub: &mut TradingHub,
        trade_id: u64,
        mut payment: Coin<TOKEN>,
        ctx: &mut TxContext
    ): GameNFT {
        let trade = table::borrow(&hub.trades, trade_id);
        assert!(!trade.is_accepted, E_TRADE_ALREADY_ACCEPTED);
        assert!(tx_context::sender(ctx) == trade.to, E_NOT_OWNER);
        assert!(coin::value(&payment) >= trade.token_amount, E_INSUFFICIENT_PAYMENT);

        // Extract payment and return excess
        let required_payment = coin::split(&mut payment, trade.token_amount, ctx);
        transfer::public_transfer(payment, trade.to);
        transfer::public_transfer(required_payment, trade.from);

        // Get NFT from storage and remove trade
        let nft = sui::dynamic_field::remove(&mut hub.id, trade.nft_id);
        let trade = table::remove(&mut hub.trades, trade_id);

        event::emit(TradeAccepted {
            trade_id,
            nft_id: trade.nft_id,
            token_amount: trade.token_amount,
            from: trade.from,
            to: trade.to
        });

        nft
    }

    public fun cancel_trade(
        hub: &mut TradingHub,
        trade_id: u64,
        ctx: &mut TxContext
    ): GameNFT {
        let trade = table::borrow(&hub.trades, trade_id);
        assert!(!trade.is_accepted, E_TRADE_ALREADY_ACCEPTED);
        assert!(tx_context::sender(ctx) == trade.from, E_NOT_OWNER);

        // Remove trade and get NFT
        let nft = sui::dynamic_field::remove(&mut hub.id, trade.nft_id);
        let trade = table::remove(&mut hub.trades, trade_id);

        event::emit(TradeCancelled {
            trade_id,
            nft_id: trade.nft_id,
            from: trade.from,
            to: trade.to
        });

        nft
    }

    // View functions
    public fun get_trade(hub: &TradingHub, trade_id: u64): (ID, u64, address, address, bool) {
        let trade = table::borrow(&hub.trades, trade_id);
        (trade.nft_id, trade.token_amount, trade.from, trade.to, trade.is_accepted)
    }

    public fun get_total_trades(hub: &TradingHub): u64 {
        hub.total_trades
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
} 
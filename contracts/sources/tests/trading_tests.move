#[test_only]
module ddc::trading_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin;

    use ddc::trading::{Self, TradingHub};
    use ddc::nft;
    use ddc::token::{Self, TOKEN};

    const TRADER_A: address = @0xA;
    const TRADER_B: address = @0xB;
    const TRADE_AMOUNT: u64 = 100;

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(TRADER_A);
        
        // Initialize modules
        {
            let ctx = ts::ctx(&mut scenario);
            token::init_for_testing(ctx);
            nft::init_for_testing(ctx);
            trading::init_for_testing(ctx);
        };

        scenario
    }

    #[test]
    fun test_create_and_accept_trade() {
        let mut scenario = setup_test();
        let trade_id: u64;
        
        // Create trade
        ts::next_tx(&mut scenario, TRADER_A);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));

            trade_id = trading::create_trade(
                &mut trading_hub,
                nft,
                TRADE_AMOUNT,
                TRADER_B,
                ts::ctx(&mut scenario)
            );

            let total_trades = trading::get_total_trades(&trading_hub);
            assert!(total_trades == 1, 0);

            ts::return_shared(trading_hub);
        };

        // Accept trade
        ts::next_tx(&mut scenario, TRADER_B);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);
            let payment = coin::mint_for_testing<TOKEN>(TRADE_AMOUNT, ts::ctx(&mut scenario));

            let nft = trading::accept_trade(
                &mut trading_hub,
                trade_id,
                payment,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(nft, TRADER_B);

            ts::return_shared(trading_hub);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_cancel_trade() {
        let mut scenario = setup_test();
        let trade_id: u64;
        
        // Create trade
        ts::next_tx(&mut scenario, TRADER_A);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));

            trade_id = trading::create_trade(
                &mut trading_hub,
                nft,
                TRADE_AMOUNT,
                TRADER_B,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(trading_hub);
        };

        // Cancel trade
        ts::next_tx(&mut scenario, TRADER_A);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);

            let nft = trading::cancel_trade(
                &mut trading_hub,
                trade_id,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(nft, TRADER_A);

            ts::return_shared(trading_hub);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = trading::E_INSUFFICIENT_PAYMENT)]
    fun test_insufficient_payment() {
        let mut scenario = setup_test();
        let trade_id: u64;
        
        // Create trade
        ts::next_tx(&mut scenario, TRADER_A);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));

            trade_id = trading::create_trade(
                &mut trading_hub,
                nft,
                TRADE_AMOUNT,
                TRADER_B,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(trading_hub);
        };

        // Try to accept with insufficient payment
        ts::next_tx(&mut scenario, TRADER_B);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);
            let payment = coin::mint_for_testing<TOKEN>(TRADE_AMOUNT - 1, ts::ctx(&mut scenario));

            let nft = trading::accept_trade(
                &mut trading_hub,
                trade_id,
                payment,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(nft, TRADER_B);

            ts::return_shared(trading_hub);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = trading::E_NOT_OWNER)]
    fun test_unauthorized_cancel() {
        let mut scenario = setup_test();
        let trade_id: u64;
        
        // Create trade
        ts::next_tx(&mut scenario, TRADER_A);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);
            let nft = nft::mint_test_nft(ts::ctx(&mut scenario));

            trade_id = trading::create_trade(
                &mut trading_hub,
                nft,
                TRADE_AMOUNT,
                TRADER_B,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(trading_hub);
        };

        // Try to cancel as non-owner
        ts::next_tx(&mut scenario, TRADER_B);
        {
            let mut trading_hub = ts::take_shared<TradingHub>(&scenario);

            let nft = trading::cancel_trade(
                &mut trading_hub,
                trade_id,
                ts::ctx(&mut scenario)
            );

            transfer::public_transfer(nft, TRADER_B);

            ts::return_shared(trading_hub);
        };

        ts::end(scenario);
    }
} 
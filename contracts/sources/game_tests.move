#[test_only]
module ddc::game_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::transfer;
   
    use ddc::game::{Self, GameAdmin, NFT};
   
    const ADMIN: address = @0xA;
    const PLAYER1: address = @0xB;
    const PLAYER2: address = @0xC;
   
    #[test]
    fun test_mint_nft() {
        let scenario = ts::begin(ADMIN);
       
        // Initialize game and create clock
        initialize_game(&mut scenario);
        create_and_share_clock(&mut scenario);
       
        // Mint NFT test
        mint_test_nft(&mut scenario, PLAYER1);
       
        // Verify NFT was minted
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let nft = ts::take_from_sender<NFT>(&scenario);
            transfer::public_transfer(nft, PLAYER1);
        };
       
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = game::EInsufficientPayment)]
    fun test_mint_nft_insufficient_payment() {
        let scenario = ts::begin(ADMIN);
        
        initialize_game(&mut scenario);
        create_and_share_clock(&mut scenario);
        
        // Try to mint with insufficient payment
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let ctx = ts::ctx(&mut scenario);
            let coin = coin::mint_for_testing<SUI>(100_000_000, ctx); // Only 0.1 SUI
            transfer::public_transfer(coin, PLAYER1);
        };
        
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let admin = ts::take_shared<GameAdmin>(&scenario);
            let payment = ts::take_from_sender<Coin<SUI>>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            
            game::mint_nft(
                &mut admin,
                &clock,
                payment,
                b"Test NFT",
                b"Test Description",
                b"Test URL",
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(admin);
            ts::return_shared(clock);
        };
        
        ts::end(scenario);
    }
   
    #[test]
    fun test_staking() {
        let scenario = ts::begin(ADMIN);
       
        // Initialize game and create clock
        initialize_game(&mut scenario);
        create_and_share_clock(&mut scenario);
       
        // Mint NFT
        mint_test_nft(&mut scenario, PLAYER1);
       
        // Stake NFT
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let nft = ts::take_from_sender<NFT>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            game::stake_nft(&mut nft, &clock, ts::ctx(&mut scenario));
            ts::return_shared(clock);
            transfer::public_transfer(nft, PLAYER1);
        };
       
        // Advance time (1 day)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let clock = ts::take_shared<Clock>(&scenario);
            clock::increment_for_testing(&mut clock, 24 * 60 * 60 * 1000);
            ts::return_shared(clock);
        };
       
        // Unstake NFT
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let nft = ts::take_from_sender<NFT>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            game::unstake_nft(&mut nft, &clock, ts::ctx(&mut scenario));
            ts::return_shared(clock);
            transfer::public_transfer(nft, PLAYER1);
           
            // Check that we received rewards
            assert!(ts::has_most_recent_for_sender<Coin<SUI>>(&scenario), 0);
        };
       
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = game::EAlreadyStaked)]
    fun test_stake_already_staked() {
        let scenario = ts::begin(ADMIN);
        
        initialize_game(&mut scenario);
        create_and_share_clock(&mut scenario);
        mint_test_nft(&mut scenario, PLAYER1);
        
        // First stake
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let nft = ts::take_from_sender<NFT>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            game::stake_nft(&mut nft, &clock, ts::ctx(&mut scenario));
            ts::return_shared(clock);
            transfer::public_transfer(nft, PLAYER1);
        };
        
        // Try to stake again
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let nft = ts::take_from_sender<NFT>(&scenario);
            let clock = ts::take_shared<Clock>(&scenario);
            game::stake_nft(&mut nft, &clock, ts::ctx(&mut scenario));
            ts::return_shared(clock);
            transfer::public_transfer(nft, PLAYER1);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_battle() {
        let scenario = ts::begin(ADMIN);
        
        initialize_game(&mut scenario);
        create_and_share_clock(&mut scenario);
        
        // Mint NFTs for both players
        mint_test_nft(&mut scenario, PLAYER1);
        mint_test_nft(&mut scenario, PLAYER2);
        
        // Battle
        ts::next_tx(&mut scenario, PLAYER1);
        {
            let nft1 = ts::take_from_sender<NFT>(&scenario);
            let nft2 = ts::take_from_address<NFT>(&scenario, PLAYER2);
            
            game::initiate_battle(&mut nft1, &mut nft2, ts::ctx(&mut scenario));
            
            transfer::public_transfer(nft1, PLAYER1);
            transfer::public_transfer(nft2, PLAYER2);
        };
        
        ts::end(scenario);
    }
   
    // Helper functions
    fun create_and_share_clock(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(scenario));
        clock::share_for_testing(clock);
    }
    
    fun initialize_game(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            game::test_init(ts::ctx(scenario));
        };
    }
   
    fun mint_test_nft(scenario: &mut Scenario, player: address) {
        // Create payment coin
        ts::next_tx(scenario, player);
        {
            let ctx = ts::ctx(scenario);
            let coin = coin::mint_for_testing<SUI>(300_000_000, ctx);
            transfer::public_transfer(coin, player);
        };
       
        // Mint NFT
        ts::next_tx(scenario, player);
        {
            let admin = ts::take_shared<GameAdmin>(scenario);
            let payment = ts::take_from_sender<Coin<SUI>>(scenario);
            let clock = ts::take_shared<Clock>(scenario);
            let name = b"Test NFT";
            let description = b"A test NFT";
            let image_url = b"https://example.com/nft.png";
           
            game::mint_nft(
                &mut admin,
                &clock,
                payment,
                name,
                description,
                image_url,
                ts::ctx(scenario)
            );
           
            ts::return_shared(admin);
            ts::return_shared(clock);
        }
    }
}
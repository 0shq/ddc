#[test_only]
module ddc::test_helpers {
    use sui::test_scenario as ts;
    use sui::coin;
    use sui::sui::SUI;
    use sui::clock;
    use std::string;
    
    use ddc::game::{Self, GameConfig};
    use ddc::nft::{Self, GameNFT};
    use ddc::battle::{Self, BattleArena, Battle};
    use ddc::staking;
    use ddc::token;

    // Common test addresses
    const ADMIN: address = @0xA;

    // Helper functions to access addresses
    public fun admin_address(): address {
        @0xAD
    }

    public fun player1_address(): address {
        @0xA1
    }

    public fun player2_address(): address {
        @0xA2
    }

    // Helper to set up basic game environment
    public fun setup_game_env(ctx: &mut ts::Scenario) {
        // Create admin cap and game config for testing
        let admin_cap = game::create_admin_cap_for_testing(ts::ctx(ctx));
        let game_config = game::create_game_config_for_testing(ts::ctx(ctx));

        // Transfer admin cap to ADMIN
        transfer::public_transfer(admin_cap, ADMIN);
        // Share game config
        transfer::public_share_object(game_config);
    }

    // Helper to fund treasury
    public fun fund_treasury(scenario: &mut ts::Scenario, amount: u64) {
        ts::next_tx(scenario, ADMIN);
        {
            let mut game_config = ts::take_shared<GameConfig>(scenario);
            let coin = coin::mint_for_testing<SUI>(amount, ts::ctx(scenario));
            game::add_to_treasury(&mut game_config, coin, ts::ctx(scenario));
            ts::return_shared(game_config);
        }
    }

    // Battle scenario setup helper
    public fun setup_battle_scenario(
        scenario: &mut ts::Scenario,
        player1_power: u64,
        player2_power: u64
    ): (BattleArena, Battle, GameNFT, GameNFT) {
        // Initialize modules if needed
        if (!ts::has_most_recent_shared<BattleArena>()) {
            let ctx = ts::ctx(scenario);
            battle::init_for_testing(ctx);
            nft::init_for_testing(ctx);
        };

        // Mint NFTs for players
        ts::next_tx(scenario, admin_address());
        {
            let ctx = ts::ctx(scenario);
            
            let nft1 = nft::mint(
                string::utf8(b"Player 1 NFT"),
                player1_power,
                50,
                50,
                50,
                ctx
            );

            let nft2 = nft::mint(
                string::utf8(b"Player 2 NFT"),
                player2_power,
                50,
                50,
                50,
                ctx
            );

            transfer::public_transfer(nft1, player1_address());
            transfer::public_transfer(nft2, player2_address());
        };

        // Create battle
        ts::next_tx(scenario, player1_address());
        {
            let mut arena = ts::take_shared<BattleArena>(scenario);
            let nft1 = ts::take_from_address<GameNFT>(scenario, player1_address());
            let nft2 = ts::take_from_address<GameNFT>(scenario, player2_address());
            let ctx = ts::ctx(scenario);

            let battle_obj = battle::create_battle(
                &mut arena,
                player1_address(),
                player2_address(),
                &nft1,
                &nft2,
                ctx
            );

            (arena, battle_obj, nft1, nft2)
        }
    }

    // Battle scenario cleanup helper
    public fun cleanup_battle_scenario(
        _scenario: &mut ts::Scenario,
        arena: BattleArena,
        battle_obj: Battle,
        nft1: GameNFT,
        nft2: GameNFT
    ) {
        ts::return_shared(arena);
        transfer::public_transfer(nft1, player1_address());
        transfer::public_transfer(nft2, player2_address());
        transfer::public_transfer(battle_obj, player1_address());
    }

    public fun init_modules_for_testing(ctx: &mut ts::Scenario) {
        let ctx_mut = ts::ctx(ctx);
        game::init_for_testing(ctx_mut);
        nft::init_for_testing(ctx_mut);
        battle::init_for_testing(ctx_mut);
        token::init_for_testing(ctx_mut);
        staking::init_for_testing(ctx_mut);
        
        // Initialize clock for testing
        let clock = clock::create_for_testing(ctx_mut);
        clock::share_for_testing(clock);
    }

    public fun mint_test_nft(
        ctx: &mut ts::Scenario,
        name: vector<u8>,
        power: u64,
        health: u64,
        defense: u64,
        speed: u64,
        _owner: address
    ): GameNFT {
        nft::mint(
            string::utf8(name),
            power,
            health,
            defense,
            speed,
            ts::ctx(ctx)
        )
    }
} 
#[allow(duplicate_alias)]
module ddc::battle {
    use sui::object;
    use sui::tx_context;
    use sui::transfer;
    use ddc::nft::{Self, GameNFT};

    // Error codes
    const EInvalidBattle: u64 = 1;
    const EInvalidTurn: u64 = 2;

    /// Battle status
    const BATTLE_CREATED: u8 = 0;
    const BATTLE_IN_PROGRESS: u8 = 1;
    const BATTLE_FINISHED: u8 = 2;

    /// Experience and rewards
    const BASE_EXPERIENCE: u64 = 100;
    const POWER_BONUS_MULTIPLIER: u64 = 5;
    const MIN_REWARD: u64 = 50;
    const MAX_REWARD: u64 = 500;

    /// Battle arena object that tracks ongoing battles
    public struct BattleArena has key {
        id: object::UID,
        active_battles: u64,
        total_battles: u64,
        total_rewards_distributed: u64
    }

    /// Individual battle instance
    public struct Battle has key, store {
        id: object::UID,
        player1: address,
        player2: address,
        player1_nft_id: object::ID,
        player2_nft_id: object::ID,
        current_turn: address,
        status: u8,
        winner: address,
        experience_gained: u64,
        reward_amount: u64
    }

    /// Initialize battle arena
    fun init(ctx: &mut tx_context::TxContext) {
        transfer::share_object(
            BattleArena {
                id: object::new(ctx),
                active_battles: 0,
                total_battles: 0,
                total_rewards_distributed: 0
            }
        );
    }

    /// Create a new battle between two players
    public fun create_battle(
        arena: &mut BattleArena,
        player1: address,
        player2: address,
        player1_nft: &GameNFT,
        player2_nft: &GameNFT,
        ctx: &mut tx_context::TxContext
    ): Battle {
        arena.active_battles = arena.active_battles + 1;
        arena.total_battles = arena.total_battles + 1;

        Battle {
            id: object::new(ctx),
            player1,
            player2,
            player1_nft_id: object::id(player1_nft),
            player2_nft_id: object::id(player2_nft),
            current_turn: player1,
            status: BATTLE_CREATED,
            winner: @0x0,
            experience_gained: 0,
            reward_amount: 0
        }
    }

    /// Calculate battle power based on character attributes
    public fun calculate_power(nft: &GameNFT): u64 {
        let strength = nft::get_strength(nft);
        let agility = nft::get_agility(nft);
        let intelligence = nft::get_intelligence(nft);
        let stamina = nft::get_stamina(nft);
        
        // Basic power formula: weighted sum of attributes
        strength * 2 + agility + intelligence + stamina
    }

    /// Calculate experience gained based on battle outcome
    fun calculate_experience(winner_power: u64, loser_power: u64): u64 {
        let power_difference = if (winner_power > loser_power) {
            winner_power - loser_power
        } else {
            loser_power - winner_power
        };

        let exp = BASE_EXPERIENCE + (power_difference * POWER_BONUS_MULTIPLIER);
        if (exp > BASE_EXPERIENCE * 2) {
            BASE_EXPERIENCE * 2
        } else {
            exp
        }
    }

    /// Calculate battle rewards based on power levels
    fun calculate_rewards(winner_power: u64, loser_power: u64): u64 {
        let base_reward = MIN_REWARD;
        let power_bonus = (winner_power + loser_power) / 100;
        let total_reward = base_reward + power_bonus;

        if (total_reward > MAX_REWARD) {
            MAX_REWARD
        } else {
            total_reward
        }
    }

    /// Start the battle
    public fun start_battle(battle: &mut Battle) {
        assert!(battle.status == BATTLE_CREATED, EInvalidBattle);
        battle.status = BATTLE_IN_PROGRESS;
    }

    /// Execute a battle turn
    public fun execute_turn(
        arena: &mut BattleArena,
        battle: &mut Battle,
        attacker_nft: &GameNFT,
        defender_nft: &GameNFT,
        ctx: &mut tx_context::TxContext
    ) {
        // Verify it's the attacker's turn
        assert!(battle.current_turn == tx_context::sender(ctx), EInvalidTurn);
        assert!(battle.status == BATTLE_IN_PROGRESS, EInvalidBattle);

        // Calculate battle outcome
        let attacker_power = calculate_power(attacker_nft);
        let defender_power = calculate_power(defender_nft);

        // Determine winner
        if (attacker_power >= defender_power) {
            battle.winner = tx_context::sender(ctx);
            battle.status = BATTLE_FINISHED;
            
            // Calculate and set experience and rewards
            battle.experience_gained = calculate_experience(attacker_power, defender_power);
            battle.reward_amount = calculate_rewards(attacker_power, defender_power);
            
            // Update arena stats
            arena.active_battles = arena.active_battles - 1;
            arena.total_rewards_distributed = arena.total_rewards_distributed + battle.reward_amount;
        } else {
            // Switch turns if no winner yet
            battle.current_turn = if (battle.current_turn == battle.player1) {
                battle.player2
            } else {
                battle.player1
            };
        }
    }

    /// Check if battle is finished
    public fun is_finished(battle: &Battle): bool {
        battle.status == BATTLE_FINISHED
    }

    /// Get battle status
    public fun get_status(battle: &Battle): u8 { battle.status }
    public fun get_winner(battle: &Battle): address { battle.winner }
    public fun get_current_turn(battle: &Battle): address { battle.current_turn }
    public fun get_experience(battle: &Battle): u64 { battle.experience_gained }
    public fun get_reward(battle: &Battle): u64 { battle.reward_amount }

    /// Get arena statistics
    public fun get_active_battles(arena: &BattleArena): u64 { arena.active_battles }
    public fun get_total_battles(arena: &BattleArena): u64 { arena.total_battles }
    public fun get_total_rewards(arena: &BattleArena): u64 { arena.total_rewards_distributed }

    #[test_only]
    public fun init_for_testing(ctx: &mut tx_context::TxContext) {
        init(ctx)
    }
} 
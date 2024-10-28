module game::game {
    use sui::event;
    use sui::random::Random;

    public struct RandomEvent has copy, drop {
        choosen: u8
    }

    entry fun play(random: &Random, ctx: &mut TxContext) {
        let mut generator = random.new_generator(ctx);
        event::emit(RandomEvent {
            choosen: generator.generate_u8_in_range(1, 3)
        });
    }
}
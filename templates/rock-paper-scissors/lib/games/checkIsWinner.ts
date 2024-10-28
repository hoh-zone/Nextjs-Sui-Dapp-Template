function strToNumber(str: string) {
    if (str === "rock")
        return 1;
    if (str === "scissors")
        return 2;
    return 3;
}

function check(my: number, move: number) {
    if (Math.abs(my - move) > 1)
        return check(my % 3, move % 3);
    return my < move;
}

export default function checkIsWinner(my_choice: string, move_choice: number) {
    return check(strToNumber(my_choice), move_choice);
}
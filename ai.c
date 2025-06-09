#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>
#include <limits.h>

#define ROWS 6
#define COLS 7

// Function prototypes
int check_winner_sim(int board[ROWS][COLS]);
int value_fn(int board[ROWS][COLS], int player);
void drop_piece_sim(int board[ROWS][COLS], int col, int mark, int* r, int* c);
void undo_move(int board[ROWS][COLS], int r, int c);

int count_nb(int arr[], int size, int value) {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (arr[i] == value) {
            count++;
        }
    }
    return count;
}

int evaluate_window(int window[4], int player) {
    int score = 0;
    int opp_player = (player == 1) ? 2 : 1;

    int player_pieces = 0;
    int opp_pieces = 0;
    int empty_slots = 0;

    for(int i=0; i<4; i++){
        if(window[i] == player) player_pieces++;
        else if(window[i] == opp_player) opp_pieces++;
        else empty_slots++;
    }

    if (player_pieces == 4) {
        score += 10000;
    } else if (player_pieces == 3 && empty_slots == 1) {
        score += 100;
    } else if (player_pieces == 2 && empty_slots == 2) {
        score += 10;
    }

    if (opp_pieces == 3 && empty_slots == 1) {
        score -= 80;
    }

    return score;
}


int _value_fn(int board[ROWS][COLS], int player) {
    int score = 0;
    int center_array[ROWS];
    for(int r=0; r<ROWS; r++) {
        center_array[r] = board[r][COLS/2];
    }
    score += count_nb(center_array, ROWS, player) * 10;

    // Horizontal
    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c <= COLS - 4; c++) {
            int window[4] = {board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]};
            score += evaluate_window(window, player);
        }
    }

    // Vertical
    for (int c = 0; c < COLS; c++) {
        for (int r = 0; r <= ROWS - 4; r++) {
             int window[4] = {board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]};
             score += evaluate_window(window, player);
        }
    }

    // Positive Diagonal
    for (int r = 0; r <= ROWS - 4; r++) {
        for (int c = 0; c <= COLS - 4; c++) {
            int window[4] = {board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]};
            score += evaluate_window(window, player);
        }
    }

    // Negative Diagonal
    for (int r = 3; r < ROWS; r++) {
        for (int c = 0; c <= COLS - 4; c++) {
            int window[4] = {board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]};
            score += evaluate_window(window, player);
        }
    }

    return score;
}

int value_fn(int board[ROWS][COLS], int player) {
    int opp_player = (player == 1) ? 2 : 1;
    return _value_fn(board, player) - 5 * _value_fn(board, opp_player);
}


void get_valid_actions(int board[ROWS][COLS], int* valid_cols, int* count) {
    *count = 0;
    for (int c = 0; c < COLS; c++) {
        if (board[0][c] == 0) {
            valid_cols[*count] = c;
            (*count)++;
        }
    }
}

void drop_piece_sim(int board[ROWS][COLS], int col, int mark, int* r_pos, int* c_pos) {
    *r_pos = -1;
    *c_pos = -1;
    for (int r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] == 0) {
            board[r][col] = mark;
            *r_pos = r;
            *c_pos = col;
            return;
        }
    }
}

void undo_move(int board[ROWS][COLS], int r, int c) {
    if (r != -1) {
        board[r][c] = 0;
    }
}

int check_winner_sim(int board[ROWS][COLS]) {
    // Horizontal
    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c <= COLS - 4; c++) {
            if (board[r][c] != 0 && board[r][c] == board[r][c + 1] && board[r][c] == board[r][c + 2] && board[r][c] == board[r][c + 3]) return board[r][c];
        }
    }
    // Vertical
    for (int c = 0; c < COLS; c++) {
        for (int r = 0; r <= ROWS - 4; r++) {
            if (board[r][c] != 0 && board[r][c] == board[r + 1][c] && board[r][c] == board[r + 2][c] && board[r][c] == board[r + 3][c]) return board[r][c];
        }
    }
    // Positive Diagonal
    for (int r = 0; r <= ROWS - 4; r++) {
        for (int c = 0; c <= COLS - 4; c++) {
            if (board[r][c] != 0 && board[r][c] == board[r + 1][c + 1] && board[r][c] == board[r + 2][c + 2] && board[r][c] == board[r + 3][c + 3]) return board[r][c];
        }
    }
    // Negative Diagonal
    for (int r = 3; r < ROWS; r++) {
        for (int c = 0; c <= COLS - 4; c++) {
            if (board[r][c] != 0 && board[r][c] == board[r - 1][c + 1] && board[r][c] == board[r - 2][c + 2] && board[r][c] == board[r - 3][c + 3]) return board[r][c];
        }
    }
    // Check for draw
    int is_full = 1;
    for (int c = 0; c < COLS; c++) {
        if (board[0][c] == 0) {
            is_full = 0;
            break;
        }
    }
    if (is_full) return -1; // Draw
    return 0; // No winner
}

// Struct to hold action and score
typedef struct {
    int action;
    int score;
} Move;

// Alphabeta function
Move alphabeta(int board[ROWS][COLS], int depth, int alpha, int beta, int max_player, int player, int ai_player) {
    int winner = check_winner_sim(board);
    if (winner != 0) {
        if (winner == ai_player) return (Move){-1, (INT_MAX - 10000) + depth};
        if (winner == player) return (Move){-1, (INT_MIN + 10000) - depth};
        return (Move){-1, 0};
    }
    if (depth == 0) {
        return (Move){-1, value_fn(board, ai_player)};
    }

    int valid_cols[COLS];
    int num_valid_cols;
    get_valid_actions(board, valid_cols, &num_valid_cols);

    if (max_player) {
        Move best_move = {-1, INT_MIN};
        if (num_valid_cols > 0) {
            best_move.action = valid_cols[0];
        }


        for (int i = 0; i < num_valid_cols; i++) {
            int action = valid_cols[i];
            int r, c;
            drop_piece_sim(board, action, ai_player, &r, &c);
            Move current_move = alphabeta(board, depth - 1, alpha, beta, 0, player, ai_player);
            undo_move(board, r, c);

            if (current_move.score > best_move.score) {
                best_move.score = current_move.score;
                best_move.action = action;
            }
            if (best_move.score > alpha) {
                alpha = best_move.score;
            }
            if (alpha >= beta) {
                break;
            }
        }
        return best_move;
    } else { // Min player
        Move best_move = {-1, INT_MAX};
         if (num_valid_cols > 0) {
            best_move.action = valid_cols[0];
        }

        for (int i = 0; i < num_valid_cols; i++) {
            int action = valid_cols[i];
            int r, c;
            drop_piece_sim(board, action, player, &r, &c);
            Move current_move = alphabeta(board, depth - 1, alpha, beta, 1, player, ai_player);
            undo_move(board, r, c);

            if (current_move.score < best_move.score) {
                best_move.score = current_move.score;
                best_move.action = action;
            }
            if (best_move.score < beta) {
                beta = best_move.score;
            }
            if (beta <= alpha) {
                break;
            }
        }
        return best_move;
    }
}

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
int find_best_move(int* board_flat, int depth, int player, int ai_player) {
    int board[ROWS][COLS];
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            board[i][j] = board_flat[i * COLS + j];
        }
    }

    Move result = alphabeta(board, depth, INT_MIN, INT_MAX, 1, player, ai_player);
    return result.action;
}

#ifdef __cplusplus
}
#endif

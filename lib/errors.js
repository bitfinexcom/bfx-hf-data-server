// NOTE: error codes should never change; if removing an error, do NOT re-use
//       the code (better, leave a note reminding the code is taken)
//
// NOTE: Errors are objects to leave room for future expansion
module.exports = {
  GENERIC: { // 1xx
    BFX_REST_ERROR: { res: 'bitfinex API error', code: 100 },
    MSG_NOT_ARRAY: { res: 'client message not an array', code: 101 },
    UNKNOWN_COMMAND: { res: 'unrecognized command', code: 102 },
    INTERNAL: { res: 'internal error', code: 103 }
  },

  BFX_PROXY: { // 4xx
    UNAVAILABLE: { res: 'cannot proxy message, no bfx proxy available', code: 400 }
  },

  BACKTEST: { // 5xx
    BT_ID_REQUIRED: { res: 'backtest ID required', code: 500 },
    ST_ID_REQUIRED: { res: 'strategy ID required', code: 502 },

    INVALID_START: { res: 'invalid start time', code: 503 },
    INVALID_END: { res: 'invalid end time', code: 504 },
    INVALID_TF: { res: 'invalid timeframe', code: 505 },
    INVALID_INCLUDE_CANDLES: { res: 'invalid includeCandles flag', code: 506 },
    INVALID_INCLUDE_TRADES: { res: 'invalid includeTrades flag', code: 507 },
    INVALID_SYNC: { res: 'invalid sync flag', code: 508 },

    SYMBOL_NOT_STRING: { res: 'symbol not a string', code: 509 },
    START_BEFORE_END: { res: 'start is before end', code: 510 },
    DUPLICATE: { res: 'backtest already exists', code: 511 },
    REQ_EMPTY: { res: 'requested empty backtest (no trades or candles)', code: 512 },
    EXCHANGE_NOT_STRING: { res: 'exchange not a string', code: 513 },

    INVALID_ALLOCATION: { res: 'invalid allocation', code: 514 },
    INVALID_MAX_POSITION_SIZE: { res: 'invalid max position size', code: 515 },
    INVALID_MAX_DRAWDOWN: { res: 'invalid max drawdown', code: 516 },
    INVALID_ABS_STOP_LOSS: { res: 'invalid absolute stop loss', code: 517 },
    INVALID_PERC_STOP_LOSS: { res: 'invalid percentage stop loss', code: 518 },
    INVALID_EXIT_MODE: { res: 'invalid exit position mode', code: 519 },
    INVALID_CANDLE_SEED: { res: 'invalid candle seed count', code: 520 }
  }
}

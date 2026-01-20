export var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["EASY"] = "easy";
    DifficultyLevel["MEDIUM"] = "medium";
    DifficultyLevel["HARD"] = "hard";
    DifficultyLevel["EXPERT"] = "expert";
    DifficultyLevel["INSANE"] = "insane";
})(DifficultyLevel || (DifficultyLevel = {}));
export var TrackType;
(function (TrackType) {
    TrackType["CITY"] = "city";
    TrackType["MOUNTAIN"] = "mountain";
    TrackType["DESERT"] = "desert";
})(TrackType || (TrackType = {}));
export var CarType;
(function (CarType) {
    CarType["SPEEDSTER"] = "speedster";
    CarType["BALANCED"] = "balanced";
    CarType["HEAVY"] = "heavy";
})(CarType || (CarType = {}));
export var GameMode;
(function (GameMode) {
    GameMode["SINGLE_PLAYER"] = "singlePlayer";
    GameMode["MULTIPLAYER"] = "multiplayer";
    GameMode["TIME_TRIAL"] = "timeTrial";
})(GameMode || (GameMode = {}));
export const DIFFICULTY_SETTINGS = {
    [DifficultyLevel.EASY]: {
        aiSpeed: 0.6,
        aiAggression: 0.3,
        damageMultiplier: 0.5,
        physicsRealism: 0.7,
        allowReset: true
    },
    [DifficultyLevel.MEDIUM]: {
        aiSpeed: 0.8,
        aiAggression: 0.5,
        damageMultiplier: 0.75,
        physicsRealism: 0.85,
        allowReset: true
    },
    [DifficultyLevel.HARD]: {
        aiSpeed: 0.95,
        aiAggression: 0.7,
        damageMultiplier: 1.0,
        physicsRealism: 1.0,
        allowReset: true
    },
    [DifficultyLevel.EXPERT]: {
        aiSpeed: 1.1,
        aiAggression: 0.85,
        damageMultiplier: 1.25,
        physicsRealism: 1.0,
        allowReset: false
    },
    [DifficultyLevel.INSANE]: {
        aiSpeed: 1.3,
        aiAggression: 1.0,
        damageMultiplier: 1.5,
        physicsRealism: 1.0,
        allowReset: false
    }
};
export const CAR_STATS = {
    [CarType.SPEEDSTER]: {
        speed: 100,
        acceleration: 85,
        handling: 70,
        weight: 800,
        durability: 60
    },
    [CarType.BALANCED]: {
        speed: 85,
        acceleration: 80,
        handling: 85,
        weight: 1000,
        durability: 80
    },
    [CarType.HEAVY]: {
        speed: 75,
        acceleration: 70,
        handling: 90,
        weight: 1300,
        durability: 100
    }
};
//# sourceMappingURL=index.js.map
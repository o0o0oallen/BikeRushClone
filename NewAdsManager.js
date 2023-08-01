var RewardHandler = /** @class */ (function() {
    function RewardHandler(owner, caller, success, fail) {
        this.owner = owner;
        this.caller = caller;
        this.success = success;
        this.fail = fail;
    }
    RewardHandler.prototype.rewared = function() {
        if (this.success) {
            this.success.apply(this.caller, []);
        }
    };
    RewardHandler.prototype.failed = function() {
        if (this.fail) {
            this.fail.apply(this.caller, []);
        }
    };
    return RewardHandler;
}());
/**
 * NewAdsManager
 */
var NewAdsManager = /** @class */ (function() {
    function NewAdsManager() {}
    /**
     * 插屏广告
     * @param type
     * @param name
     */
    NewAdsManager.showInterstitial = function(type, name, caller, fn) {
        console.error('NewAdsManager.showInterstitial')
        if (type === void 0) {
            type = "next";
        }
        if (name === void 0) {
            name = "game";
        }
        window["adBreak"]({
            type: type,
            name: name,
            beforeBreak: function() {
                Laya.timer.scale = 0;
                //静音
            },
            afterBreak: function() {
                Laya.timer.scale = 1;
            }
        });
        fn.apply(caller, [true]);
    };
    /**
     * 激励广告
     * @param button
     * @param name
     * @param caller
     * @param fn
     */
    NewAdsManager.push = function(owner, caller, success, fail) {
        var isHasHandler = false;
        for (var _i = 0, _a = this._rewardHandlers; _i < _a.length; _i++) {
            var iter = _a[_i];
            if (iter.owner === owner) {
                isHasHandler = true;
                break;
            }
        }
        if (!isHasHandler) {
            var rewardHander = new RewardHandler(owner, caller, success, fail);
            this._rewardHandlers.push(rewardHander);
        }
        if (this._showAdFn) {
            this.onRefresh(true);
        } else {
            this.preLoadReward();
        }
    };
    /**
     * 刷新按钮状态
     * @param canRewarded
     */
    NewAdsManager.onRefresh = function(canRewarded) {
        //移除无用按钮
        for (var i = 0; i < this._rewardHandlers.length; i++) {
            var iter = this._rewardHandlers[i];
            if (!iter.owner || iter.owner == null) {
                this._rewardHandlers.splice(i, 1);
                i--;
                continue;
            }
            // if (!iter.owner.displayedInStage) {
            //     this._rewardHandlers.splice(i, 1);
            //     i--;
            //     continue;
            // }
            // if (!iter.owner["activeInHierarchy"]) {
            //     this._rewardHandlers.splice(i, 1);
            //     i--;
            //     continue;
            // }
        }
        for (var _i = 0, _a = this._rewardHandlers; _i < _a.length; _i++) {
            var iter_1 = _a[_i];
            console.log("disabled", iter_1.owner)
            iter_1.owner.disabled = !canRewarded;
            iter_1.owner.off(Laya.Event.MOUSE_DOWN, NewAdsManager, NewAdsManager.showRwared);
            if (canRewarded) {
                iter_1.owner.on(Laya.Event.MOUSE_DOWN, NewAdsManager, NewAdsManager.showRwared, [iter_1]);
            }
        }
    };
    NewAdsManager.remove = function(owner) {
        for (var i = 0; i < this._rewardHandlers.length; i++) {
            var iter = this._rewardHandlers[i];
            if (!iter.owner || iter.owner == null) {
                this._rewardHandlers.splice(i, 1);
                i--;
                continue;
            }
            if (iter.owner == owner) {
                this._rewardHandlers.splice(i, 1);
                i--;
                continue;
            }
        }
    };
    NewAdsManager.showRwared = function(currentReward) {
        console.error('NewAdsManager.showRwared')
        this._currentReward = currentReward;
        if (this._showAdFn) {
            this._showAdFn();
        }
        this._showAdFn = null;
    };
    NewAdsManager.onRewarded = function() {
        if (this._currentReward) {
            this._currentReward.rewared();
        }
        for (var i = 0; i < this._rewardHandlers.length; i++) {
            var iter = this._rewardHandlers[i];
            if (!iter.owner || iter.owner == null) {
                this._rewardHandlers.splice(i, 1);
                break;
            }
        }
        this._currentReward = null;
        this.preLoadReward();
    };
    NewAdsManager.onFialed = function() {
        if (this._currentReward) {
            this._currentReward.failed();
        }
        this._currentReward = null;
        this.preLoadReward();
    };
    NewAdsManager.preLoadReward = function() {
        var _this = this;
        this.onRefresh(false);
        window["adBreak"]({
            type: "reward",
            name: "GAME_REWARDED",
            beforeBreak: function() {},
            afterBreak: function() {},
            beforeReward: function(showAdFn) {
                _this._showAdFn = showAdFn;
                _this.onRefresh(true);
            },
            adDismissed: function() {
                _this.onFialed();
            },
            adComplete: function() {
                _this.onRewarded();
            },
        });
    };
    NewAdsManager._rewardHandlers = [];
    return NewAdsManager;
}());
window["NewAdsManager"] = NewAdsManager;
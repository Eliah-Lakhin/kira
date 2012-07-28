(function() {
    var console = this.console;
    Kira.console = {
        log: function(message) {
            console.log(message);
            return message;
        },
        profile: function(block) {
            var start = new Date().getTime();
            block();
            return new Date().getTime() - start;
        },
        logProfile: function(message, block) {
            if (block === undefined) {
                block = message;
                message = "%s";
            }
            console.log(message.replace("%s", Kira.profile(block)));
        }
    };
})();
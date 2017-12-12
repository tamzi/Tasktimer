// tasktimer object contains all the values used by the tasktimer clock, as well as methods to manipulate those values and show them in the html widget.
var ding = new Audio("audio/ding.mp3"),
    tasktimer = {
        isBreak: false,
        isPaused: false,
        timeRemaining: 0,
        startTime: 0,
        stopTime: 0,
        action1: "start", // The text of the first action button
        // is stored here because it was annoying
        // evaluating the button text directly.
        sessionLength: {
            value: 25,
            increase: function() {
                this.value++;
                $("#session-length").text(this.value);
                $("#counter").text(this.value.toString() + ":00");
            },
            decrease: function() {
                if (this.value > 1) {
                    this.value--;
                    $("#session-length").text(this.value);
                    $("#counter").text(this.value.toString() + ":00");
                }
            }
        },
        breakLength: {
            value: 5,
            increase: function() {
                this.value++;
                $("#break-length").text(this.value);
            },
            decrease: function() {
                if (this.value > 1) {
                    this.value--;
                    $("#break-length").text(this.value);
                }
            }
        },
        reset: function(softReset) {
            // This resets the tasktimer object
            // and the DOM to its original state.
            if (!softReset) {
                // If a soft reset is requested, then don't reset
                // user inputted break and session lengths.
                // If a soft reset is not requested, then reset
                // everything.
                this.sessionLength.value = 25;
                this.breakLength.value = 5;
                $("#session-length").text(25);
                $("#break-length").text(5);
            }
            this.isBreak = false;
            this.isPaused = false;
            this.timeRemaining = 0;
            this.action1 = "start"
            $("#action1").text("start");
            $("#action2").css({
                "visibility": "hidden"
            });
            toggleVisible("show");
            this.startTime = 0;
            this.endTime = 0;
            $("#counter").text(this.sessionLength.value.toString() + ":00");
        },
        start: function() {
            // This starts the timer.

            this.startTime = new Date().getTime();
            this.endTime = this.startTime + (this.sessionLength.value * 60 * 1000) + 1000; // I added an extra second so that the time the counter displays will start with the inputted breaktime/endtime (start with 5:00 instead of 4:59)
        },
        stop: function() {
            // This stops the timer and resets it using
            // the current values for session and break
            // length.
            this.reset(true); // Do a soft reset.
        },
        pause: function() {
            // This pauses the timer, allowing the user to
            // resume at any later time.
            this.isPaused = true;
        },
        resume: function() {
            // This starts the timer using the time remaining.
            this.isPaused = false;
            this.startTime = new Date().getTime();
            this.endTime = this.startTime + this.timeRemaining;
        }
    },
    modal = {
        show: function() {
            $("#overlay").css({
                "display": "flex",
                "visibility": "hidden"
            });
            $("#overlay").hide();
            $("#overlay").css({
                "visibility": "visible"
            })
            $("#overlay").fadeIn(300, function() {
                $("#modal").fadeIn(300);
            });
        },
        hide: function() {
            $("#modal").fadeOut(300, function() {
                $("#overlay").fadeOut(300);
            });
        }
    }

function playDing() {
    // Checks if sound is enabled and plays a ding.
    if ($("#switch-sound").is(':checked')) {
        ding.play();
    }
}

function toggleVisible(showHide) {
    // Toggle between the options being visible or not.
    var top = $(".mdl-card__title");
    var bottom = $(".mdl-card__supporting-text");
    if (showHide === "show") {
        $("#message").fadeOut(300, function() {
            top.animate({
                height: 125
            }, 300);
            bottom.slideDown(300);
        });
    } else {
        // hide options.
        top.animate({
            height: top.height() + bottom.height() + 64
        }, 300, function() {
            $("#message").text("Do the thing!");
            $("#message").fadeIn(300);
        });
        bottom.slideUp(300);
    }
}

function msToMinutes(ms) {
    // converts miliseconds into a 0:00 format string
    // showing minutes on the left and seconds on
    // the right.
    var minutes = Math.floor(ms / 60000).toString();
    var seconds = Math.floor((ms % 60000) / 1000).toString();
    if (seconds.length === 1) {
        seconds = "0" + seconds
    }
    return tasktimer.timeRemaining > 0 ? minutes + ":" + seconds : "0:00";
}

window.setInterval(function() {
    if (tasktimer.startTime > 0 &&
        tasktimer.isPaused === false) {
        var now = new Date().getTime();

        tasktimer.timeRemaining = tasktimer.endTime - now;
        $("#counter").text(msToMinutes(tasktimer.timeRemaining));
        if (tasktimer.timeRemaining < 0 &&
            tasktimer.isBreak === false) {
            tasktimer.isBreak = true;
            $("#message").fadeOut(300, function() {
                $("#message").text("Pause for some minutes!");
                $("#message").fadeIn(300, function() {
                    playDing();
                });
            })
            tasktimer.endTime = now + (tasktimer.breakLength.value * 60 * 1000) + 1000;
        } else if (tasktimer.timeRemaining < 0 &&
            tasktimer.isBreak === true) {
            tasktimer.isBreak = false;
            $("#message").fadeOut(300, function() {
                $("#message").text("On with it now!!!");
                $("#message").fadeIn(300, function() {
                    playDing();
                });
            });

            tasktimer.start();
        }
    } else {
        // do nothing.
    }
}, 100);

$(document).ready(function() {
    $("#reset").click(function() {
        tasktimer.reset();
    });
    $("#action1").click(function() {
        if (tasktimer.action1 === "start" ||
            tasktimer.action1 === "resume") {
            // Decide whether to start or resume.
            if (tasktimer.action1 === "start") {
                toggleVisible("hide");
                tasktimer.start();
            } else {
                tasktimer.resume();
            }
            // Change which action buttons are visible.
            tasktimer.action1 = "pause";
            $(this).text(tasktimer.action1);
            $("#action2").css({
                "visibility": "visible"
            });
        } else if (tasktimer.action1 === "pause") {
            tasktimer.pause();
            tasktimer.action1 = "resume";
            $(this).text(tasktimer.action1);
        }
    })
    $("#action2").click(function() {
        toggleVisible("show");
        tasktimer.stop();
        tasktimer.action1 = "start"
        $("#action1").text(tasktimer.action1);
        $("#action2").css({
            "visibility": "hidden"
        });
    })

    $("#session-plus").click(function() {
        tasktimer.sessionLength.increase();
    });
    $("#session-minus").click(function() {
        tasktimer.sessionLength.decrease();
    });
    $("#break-plus").click(function() {
        tasktimer.breakLength.increase();
    });
    $("#break-minus").click(function() {
        tasktimer.breakLength.decrease();
    });

    $("#switch-sound").change(function() {
        playDing();
    });

    $("#fcc").click(function() {
        modal.show();
    })
    $("#close").click(function() {
        modal.hide();
    })
    $("#overlay").click(function() {
        modal.hide();
    });
})

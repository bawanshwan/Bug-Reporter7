var fw7 = new Framework7({
	animateNavBackIcon: true,
	sortable: false,
	cache: false,
	preloadPreviousPage: false,
	modalTitle: unescape("Bug Reporter%u2078"),
	notificationCloseIcon: false,
	notificationCloseOnClick: true,
});
var $$ = Dom7;
var mainView = fw7.addView(".view-main", {
	dynamicNavbar: true,
});
var startscreenView = fw7.addView(".view-popup-startscreen", {
	dynamicNavbar: true,
});
$(document).ready(function() {
  $.ajaxSetup({ cache: false });
});

var getIndexIfObjWithOwnAttr = function(array, attr, value) {
	for(var i = 0; i < array.length; i++) {
		if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
			return i;
		}
	}
	return -1;
};
var giveRandom = function(limit) {
	return Math.floor(Math.random() * limit) + 1;
};

(function() {
	"use strict",
	window.BugReporter8 = function(params) {
		var app = this;
		app.version = "2.0";
		app.build = "12A365";
		app.params = {
			modern : {
				enabled: true,			// Default: false
				swipeToDelete: false,	// Default: true
				swipeToDeleteLimit: 100	// Default: 100
			},
			swipeToDelete: false,
			lastSlideValue: 0,
			slideClosing: false
		};
		app.mainSite = "index.html";
		app.intervals = [];

		for (var param in params) {
			app.params[param] = params[param];
		}
		app.progress = 0;
		app.bugsStorage = [];
		/* Methods */
		app.init = function() {
			/*if (localStorage.getItem("br8-settings") != null) {
				$('body').addClass(JSON.parse(localStorage.getItem("br8-settings")).background)
			}
			if (localStorage.getItem("welcomeDisplayed") == null) {
				$('.popup-startscreen').addClass("no-transition modal-in");
				setTimeout(function() {
					$('.popup-startscreen').removeClass("no-transition");	
				}, 100);
				localStorage.setItem("welcomeDisplayed", true);
			} else {
				$('.popup-startscreen').css("display","none");
			}*/
			if (localStorage.getItem("f7form-form-theme") && localStorage.getItem("f7form-form-tint")) {
				app.changeTheme($.parseJSON(localStorage.getItem("f7form-form-theme")).theme);
				app.changeTint($.parseJSON(localStorage.getItem("f7form-form-tint")).tint);
			};

			app.initAppView();
			$('body').i18n();
		};
		
		app.initAppView = function() {
			if (fw7.device.webView != null) {
				$("meta[name='apple-mobile-web-app-status-bar-style']").remove();
			}
			var dataCheck;
			$.getJSON("apps/apps.json", function(data) {
				dataCheck = data;
			});
			
			//if (localStorage.getItem("apps") == null) {
			$.getJSON("apps/apps.json", function(data) {
				$('div.page-content#app-screen, div.apps-wrapper').html("");
				$.each(data.apps, function() {
					$('div.page-content#app-screen').append($("#app-template-new").html().replace(/{{path}}/g,this.data).replace(/{{executable}}/g,this.executable).replace(/{{title}}/g, this.title).replace(/{{subtitle}}/g, this.subtitle).replace(/{{icon}}/g, this.icon).replace(/{{date}}/g,(new Date).getMilliseconds()).replace(/{{iconLight}}/g,this.iconLight));
					
					var timeoutEdit = 0;
					$('div.icon:last-child()').on('mousedown touchstart', function() {
						timeoutEdit = setTimeout(function() {
							$('#app-screen, div.icon').addClass("edit");
							$("div.icon a").on("click", function(e) {
								return false;
							});
								mainView.showToolbar();
							console.log("test");
						}, 1000);
					}).on('mouseup touchend', function(e) {
						clearTimeout(timeoutEdit);
					});
				});
				setTimeout(function() {
					$('body').i18n();
				}, 50);
			});
		};
		app.openApp = function(appId) {
			fw7.mainView.loadPage("apps/"+appId+"/index.html");
			$('body').addClass("app-open");
		};
		app.home = function() {
			$('div.pages div.page:last-child').addClass("app");
			if (fw7.mainView.history.length > 2) {
				fw7.mainView.router.back({url: app.mainSite, force: true});
			} else {
				fw7.mainView.back();
			}
			br8.initAppView();
			$('body').removeClass("app-open");
		};
		
		app.addBadgeToApp = function(appId, badgeCount) {
			$('div.icon[data-appid="'+appId+'"]').addClass("notification");
			if ($('div.icon[data-appid="'+appId+'"]').children("div.notification-badge").length < 1) {
				$('div.icon[data-appid="'+appId+'"]').append('<div class="notification-badge"></div>');
			}
			$('div.icon[data-appid="'+appId+'"] div.notification-badge').html(badgeCount);
		};
		app.clearBadges = function(appId) {
			$('div.icon[data-appid="'+appId+'"] div.notification-badge').remove();
			$('div.icon[data-appid="'+appId+'"]').removeClass("notification");
		};
		
		app.addBugToStorage = function() {
			var date = new Date();
			var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
			var dateString = ("0" + date.getDate()).slice(-2) + "-" + monthNames[date.getMonth()] + "-" + date.getFullYear() + " " +	 ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
			app.bugsStorage.push({
				title: $('[name="newBugName"]').val() + " ",
				category: $('[name="newBugCat"]').val() + " ",
				description: $('[name="newBugDesc"]').val() + " ",
				//author: readCookie("username"),
				status: "open",
				id: app.bugsStorage.length +1,
				date: dateString
			});
			localStorage.openBugsData = JSON.stringify(app.bugsStorage);
			fw7.showPreloader("Processing...");
			setTimeout(function() {
				fw7.hidePreloader();
				setTimeout(function() {
					fw7.closeModal();
					//br7.generateHTML("open");
					setTimeout(function() {
						$('[name="newBugName"]').val("");
						$('[name="newBugDesc"]').val("");
					}, 300);
					setTimeout(function() {
						$('.views').removeClass("popup-compose");
						//app.generateHTML("open");
					}, 500);
				}, 500);
			}, 2000);
		};
		app.removeBugFromStorage = function(bugId) {};
		
		app.readSettings = function() {
			var data = localStorage.br8Settings;
			return data;
		};
		app.writeSettings = function(option, value) {
			var data = {};
			data["option"] = value;
			comsole.log(data);
		};
		
		app.changeTheme = function(themeName, write) {
			var setWrite = ((write != undefined)) ? write : true;
			
			$('body').removeClass('layout-dark layout-light layout-white layout-undefined').addClass("layout-"+themeName);
			if (setWrite) {
				var settings = JSON.parse(localStorage.getItem("f7form-form-theme"));
				settings.theme = themeName;
				localStorage.setItem("f7form-form-theme", JSON.stringify(settings));
			}
		};
		app.changeTint = function(tintName, write) {
			var setWrite = ((write != undefined)) ? write : true;

			$('body').removeClass('tint-lightblue tint-yellow tint-orange tint-pink tint-blue tint-green tint-red tint-undefined').addClass("tint-"+tintName);
			$('body').removeClass('theme-lightblue theme-yellow theme-orange theme-pink theme-blue theme-green theme-red theme-undefined').addClass("theme-"+tintName);
			if (setWrite) {
				var settings = JSON.parse(localStorage.getItem("f7form-form-tint"));
				settings.tint = tintName;
				localStorage.setItem("f7form-form-tint", JSON.stringify(settings));
			}

		};
		
		app.applyModernMode = function(callback) {
			$('#modernStatus').html(app.params.modern.enabled.toString());
			$('form#switch-ios8 li#switchSwipeout.disabled').removeClass("disabled");
			var c = callback;
			if (app.params.modern.enabled) {
				$('body').addClass("ios8");
				$('.swipeout-content').css("-webkit-transform","translate3d(0,0,0)");
				$$('.swipeout').on("swipeout", function(e) {
					var elThis = $(this);
					var el = $(this).children(".swipeout-actions").children(".swipeout-actions-inner");
					if (app.params.modern.enabled) {
					if (e.detail.progress.toFixed(3) > app.params.lastSlideValue || e.detail.progress.toFixed(3) < app.params.lastSlideValue || app.params.slideClosing) {
						app.params.lastSlideValue = e.detail.progress.toFixed(3);
							//console.log(app.params.lastSlideValue);
						if (Math.round(e.detail.progress*100) < app.params.modern.swipeToDeleteLimit) {
							var matrix = elThis.children(".swipeout-content").css('transform');
							var values = matrix.match(/-?[0-9\.]+/g);
		
							app.params.swipeToDelete = false;
							for (var i=el.children("a").length; i>0; i--) {
								el.children("a:nth-child("+i+")").css({
									"transition": "transform 0ms",
									"transform": "translate3d("+ (parseInt(values[4])+(80*el.children("a").length))/el.children("a").length*((el.children("a").length+1)-i) +"px,0,0)",
									"-moz-transition": "-moz-transform 0ms",
									"-moz-transform": "translate3d("+ (parseInt(values[4])+(80*el.children("a").length))/el.children("a").length*((el.children("a").length+1)-i) +"px,0,0)",
									"-webkit-transition": "-webkit-transform 0ms",
									"-webkit-transform": "translate3d("+ (parseInt(values[4])+(80*el.children("a").length))/el.children("a").length*((el.children("a").length+1)-i) +"px,0,0)"
								});
							}
							el.children("a:last-child").children("div").css({
								"transform": "translate3d(0,0,0)",
								"-moz-transform": "translate3d(0,0,0)",
								"-webkit-transform": "translate3d(0,0,0)"
							});
	
						} else if (app.params.modern.swipeToDelete) {
							app.params.swipeToDelete = true;
							var matrix = elThis.children(".swipeout-content").css('transform');
							var values = matrix.match(/-?[0-9\.]+/g);
							el.children("a").addClass("no-transition").css({
								"transform": "translate3d("+(parseInt(values[4])+(80*el.children("a").length))+"px,0,0)",
								"-moz-transform": "translate3d("+(parseInt(values[4])+(80*el.children("a").length))+"px,0,0)",
								"-webkit-transform": "translate3d("+(parseInt(values[4])+(80*el.children("a").length))+"px,0,0)"
							});
							el.children("a:last-child").children("div").css({
								"transform": "translate3d(-"+(el.children("a").length-1)+"00%,0,0)",
								"-moz-transform": "translate3d(-"+(el.children("a").length-1)+"00%,0,0)",
								"-webkit-transform": "translate3d(-"+(el.children("a").length-1)+"00%,0,0)"
							});
						} else {
							var matrix = elThis.children(".swipeout-content").css('transform');
							var values = matrix.match(/-?[0-9\.]+/g);
		
							app.params.swipeToDelete = false;
							for (var i=el.children("a").length; i>0; i--) {
								el.children("a:nth-child("+i+")").css({
									"transition": "transform 0ms",
									"transform": "translate3d("+ (parseInt(values[4])+(80*el.children("a").length))/el.children("a").length*((el.children("a").length+1)-i) +"px,0,0)",
									"-moz-transition": "-moz-transform 0ms",
									"-moz-transform": "translate3d("+ (parseInt(values[4])+(80*el.children("a").length))/el.children("a").length*((el.children("a").length+1)-i) +"px,0,0)",
									"-webkit-transition": "-webkit-transform 0ms",
									"-webkit-transform": "translate3d("+ (parseInt(values[4])+(80*el.children("a").length))/el.children("a").length*((el.children("a").length+1)-i) +"px,0,0)"
								});
							}
							el.children("a:last-child").children("div").css({
								"transform": "translate3d(0,0,0)",
								"-moz-transform": "translate3d(0,0,0)",
								"-webkit-transform": "translate3d(0,0,0)"
							});
						}
					}
					}
				});
				$$('.swipeout').on("open", function() {
					var elThis = $(this);
					var el = $(this).children(".swipeout-actions").children(".swipeout-actions-inner");
					if (app.params.modern.enabled) {
						el.children("a").removeClass("no-transition").addClass("swipeout-open").css({
							"transition":"",
							"transform":"",
							"-moz-transition":"",
							"-moz-transform":"",
							"-webkit-transition":"",
							"-webkit-transform":""
						});
						if (app.params.swipeToDelete) {
							app.params.swipeToDelete = false;
							app.params.lastSlideValue = 0;
							app.params.slideClosing = true;
							fw7.swipeoutDelete(elThis);
							if (callback == "open" || callback == "closed") {
								var issueID = parseInt($(this).closest(".swipeout").children(".swipeout-content").children(".issueID").html());
								var bugObject = bugsStorage[issueID-1];
								bugObject.status = callback;
								bugsStorage[issueID-1] = bugObject;
								localStorage.bugsData = JSON.stringify(bugsStorage);
								$$('.swipeout').on("deleted", function() {
									$(this).closest(".list-block").remove();
									if ($('.page.on-center').children("div.list-block").length < 1) {
										$('.page-content.bug-no-bg').addClass("bug-bg");
									}
								});
							} else if (callback == "deleted") {
								var issueID = parseInt($(this).closest(".swipeout").children(".swipeout-content").children(".issueID").html());
								var bugObject = bugsStorage[issueID-1];
								var index = bugsStorage.indexOf(bugObject);
								$$('.swipeout').on("deleted", function() {
									$(this).closest(".list-block").remove();
									if ($('.page.on-center').children("div.list-block").length < 1) {
										$('.page-content.bug-no-bg').addClass("bug-bg");
									}
								});
								if (index > -1) {
									bugsStorage.splice(index, 1);
									localStorage.bugsData = JSON.stringify(bugsStorage);
								}

							}
						}
					}
				});
				$$('.swipeout').on("close", function() {
					var elThis = $(this);
					var el = $(this).children(".swipeout-actions").children(".swipeout-actions-inner");
					if (app.params.modern.enabled) {
						for (var i=el.children("a").length; i>0; i--) {
							el.children("a:nth-child("+i+")").css({
								"transition": "",
								"transform": "translate3d("+(100*(el.children("a").length-i)+100)+"%,0,0)",
								"-moz-transition": "",
								"-moz-transform": "translate3d("+(100*(el.children("a").length-i)+100)+"%,0,0)",
								"-webkit-transition": "",
								"-webkit-transform": "translate3d("+(100*(el.children("a").length-i)+100)+"%,0,0)"
							});
						}
						app.params.lastSlideValue = 0;
						app.params.slideClosing = false;
					}
				});
			}
		}
		
		app.addUpdateScreen = function(target, restore) {
			//
			if (restore) {
				var buttons1 = [
					{
						text: 'This will delete all media and data,<br>and reset all settings.',
						label: true
					},
					{
						text: 'Restore Bug Reporter\u2078',
						color: 'red',
						onClick: function() {
							$('body').append('<div class="update-view restore"><p class="restore-title">Restore in Progress</p></div>');
							setTimeout(function() {
								$('.update-view').append("<div class=\"progress-bar\"><div class=\"inner-progress\" id=\"update-progress\"></div></div>");
								localStorage.clear();
								app.intervals.push(setInterval(function() {
									app.addProgressToBar("update-progress");
								}, giveRandom(750)));
							}, 1000);
						}
					}
				];
				var buttons2 = [
					{
						text: 'Cancel'
					}
				];
				fw7.actions([buttons1, buttons2]);
			} else {
				fw7.showPreloader('Verifying update...');
				setTimeout(function() {
					$('body').append('<div class="update-view"></div>');
					setTimeout(function() {
						fw7.hidePreloader();
					}, 500)
				},2000);
				setTimeout(function() {
					$('.update-view').append('<img src="apps/de.sniperger.preferences/PreferencesIconBackground@2x~iphone.png" /><img class="inner-gear" src="apps/de.sniperger.preferences/PreferencesIconInnerGear@2x~iphone.png" /><img class="outer-gear-shadow" src="apps/de.sniperger.preferences/PreferencesIconOuterGearShadow@2x~iphone.png" /><img class="outer-gear" src="apps/de.sniperger.preferences/PreferencesIconOuterGear@2x~iphone.png" />');
					setTimeout(function() {
						$('.update-view').append("<div class=\"progress-bar\"><div class=\"inner-progress\" id=\"update-progress\"></div></div>");
						app.intervals.push(setInterval(function() {
							app.addProgressToBar("update-progress");
						}, giveRandom(750)));
					}, 1000);
				}, 3000);
			}
			
		};
			app.addProgressToBar = function(selector, callback) {
			if (app.progress < 100) {
				var randomValue = giveRandom(30);
				if ((app.progress + randomValue) <= 100) {
					app.progress = app.progress + randomValue;
				} else {
					app.progress = 100;
				}
			} else if (app.progress >=100) {
				app.progress = 100;
				clearInterval(app.intervals[0]);
				app.intervals[0] = undefined;
				setTimeout(function() { $('.progress-bar').remove() }, 1000);
				setTimeout(function() { window.location.reload() }, 2000);
		
			}
			$('#'+selector).css("width",app.progress+"%");
		};
		
		app.init();
	}
})();

$('a.submit-bug').on("click", function() {
	br8.addBugToStorage();
	alert(localStorage.openBugsData);
});

fw7.onPageBeforeAnimation("index", function() {
	br8.initAppView();
});


fw7.onPageBeforeAnimation("bugs-open", function() {
	$('.swipeout-actions-inner').children("a").css("line-height", $('.swipeout-actions-inner').closest("li.swipeout").height()+"px");
	br8.applyModernMode("closed");
});
fw7.onPageBeforeAnimation("tips-content", function() {
	fw7.showIndicator();
	br8.initTips();
});

fw7.onPageBeforeAnimation("setup", function() {
	if (localStorage.getItem("f7form-form-theme")) {
		if ($.parseJSON(localStorage.getItem("f7form-form-theme")).theme == "light" || $.parseJSON(localStorage.getItem("f7form-form-theme")).theme == "white") {
			$('.navbar').addClass("layout-white");
		}
	}
});
fw7.onPageAfterAnimation("setup", function() {
	mainView.showNavbar();
});


$('.hb').on("click", function() {
	if (!$('#app-screen').hasClass("edit")) {
		br8.home();
	} else {
		$('#app-screen, div.icon').removeClass("edit");
		br8.initAppView();
		mainView.hideToolbar();
	}
});
$$(document).on('ajaxStart', function() {
	//fw7.showIndicator();
});
$$(document).on('ajaxComplete', function() {
	fw7.hideIndicator();
});
fw7.onPageInit('settings-tint', function() {
	$('form#form-tint li').on("click", function() {
		setTimeout(function() {
			br8.changeTint($.parseJSON(localStorage.getItem("f7form-form-tint")).tint);
		}, 10);
	});
});
fw7.onPageInit('settings-theme', function() {
	$('form#form-theme li').on("click", function() {
		setTimeout(function() {
			br8.changeTheme($.parseJSON(localStorage.getItem("f7form-form-theme")).theme);
		}, 10);
	});
});

var appStart = "";
$$('.popup-startscreen').on('close', function () {
	//mainView.loadPage("apps/"+appStart+"/index-noapp.html");
	fw7.hideToolbar();
});
$$('.popup-startscreen').on('closed', function () {
	$('.toolbar').addClass("toolbar-hidden");
}); 

fw7.onPageInit('virtual-list', function (page) {
	// Generate array with 10000 demo items:
	var items = [], itemsPrevious = [];
	$.getJSON("update.json", function(data) {
		items.push({
			version: data.updates.current.version,
			build: data.updates.current.build
		});
		$.each(data.updates.previous, function() {
			itemsPrevious.push({
				version: this.version,
				build: this.build
			});
		});
		 var virtualList1 = fw7.virtualList($$(page.container).find('.virtual-list1'), {
			 // Pass array with items
			 items: items,
			 // List item Template7 template
			 template: '<li>' +
						 '<a href="apps/de.sniperger.update/updates/{{version}}.html?'+(new Date).getMilliseconds()+'" class="item-link item-content">' +
						   '<div class="item-inner">' +
							 '<div class="item-title-row">' +
							   '<div class="item-title">{{version}} ({{build}})</div>' +
							 '</div>' +
						   '</div>' +
						 '</a>' +
					   '</li>',
		 });
	
		 var virtualList2 = fw7.virtualList($$(page.container).find('.virtual-list2'), {
			 // Pass array with items
			 items: itemsPrevious,
			 // List item Template7 template
			 template: '<li>' +
						 '<a href="#" class="item-link item-content">' +
						   '<div class="item-inner">' +
							 '<div class="item-title-row">' +
							   '<div class="item-title">{{version}} ({{build}})</div>' +
							 '</div>' +
						   '</div>' +
						 '</a>' +
					   '</li>',
		 });
	});
	/*for (var i = 0; i < 10; i++) {
		items.push({
			title: 'Item ' + i,
		});
	}*/

	// Create virtual list

});
fw7.onPageBeforeAnimation("about", function() {
	$('.page[data-page="about"] .page-content').html($('.page[data-page="about"] .page-content').html().replace(/{{version}}/g, br8.version).replace(/{{build}}/g, br8.build).replace(/{{fw7version}}/g, fw7.version));
});


// Tips Notification on start
/*
fw7.addNotification({
	title: "Tips",
	message: "Try out the new Tips app",
	media: "<img src=\"apps/de.sniperger.tips/AppIcon-Tips.png\" width=\"29\" height=\"29\"/>",
	onClose: function() { setTimeout(function(){fw7.mainView.loadPage("apps/de.sniperger.tips/index.html")},450) }
})
*/
// Software Update Notification on start
/*
fw7.addNotification({
	title: "Software Update",
	message: "Version 8.1.1 is now available",
	media: "<img src=\"apps/de.sniperger.update/AppIcon-Update.png\" width=\"29\" height=\"29\"/>",
	onClose: function() { setTimeout(function(){fw7.mainView.loadPage("apps/de.sniperger.update/index.html")},450) }
})
*/
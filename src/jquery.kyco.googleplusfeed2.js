/***************************************\

	jquery.kyco.googleplusfeed
	==========================

	Version 2.0.2

	Brought to you by
	http://www.kycosoftware.com/

	Copyright 2014 Cornelius Weidmann

	Distributed under the GPL

\***************************************/

(function($) {
	var methods = {
		init: function(options) {
			var defaults = {
				feedPosts        : 3,   // Feed posts to show on load
				postsIncrement   : 3,   // Number of feed posts to show on "Show more" button click
				maxPosts         : 20,  // Max number of posts to pull before "Show more" will go to Google+, cannot exceed 20 because of Google API
				profileImageSize : 50,  // Max size is 250
				lang             : 'en' // Default language, can also be set to 'de'
			};

			var settings = $.extend({}, defaults, options);

			return this.each(function() {
				var selector = $(this);

				// Localization
				settings.lang = settings.lang === 'en' ? {
					langCode      : 'en',
					loading       : 'Loading...',
					showMore      : 'Show more',
					viewMore      : 'View more posts on Google+',
					shared        : 'Shared publicly - ',
					viewPost      : 'View post',
					errorEmpty    : 'Nothing to show. Empty feed. ',
					retryEmpty    : 'Refresh',
					errorGeneral  : 'Unable to retrieve feed contents. ',
					errorNotFound : 'User not found... Enter a valid Google+ ID',
					retryGeneral  : 'Retry'
				} : {
					langCode      : 'de',
					loading       : 'Wird geladen...',
					showMore      : 'Mehr anzeigen',
					viewMore      : 'Weitere Beiträge ansehen bei Google+',
					shared        : 'Öffentlich geteilt - ',
					viewPost      : 'Beitrag ansehen',
					errorEmpty    : 'Nichts zu sehen. Keine Beiträge. ',
					retryEmpty    : 'Wiederholen',
					errorGeneral  : 'Es ist ein Fehler beim Abrufen der Beiträge aufgetreten. ',
					errorNotFound : 'Benutzer nicht gefunden... Verwende einen gültigen Google+ ID',
					retryGeneral  : 'Wiederholen'
				};

				// Create feed DOM elements.
				var container      = $('<div id="feed_' + selector.attr('class') + '" class="kyco_googleplusfeed ' + settings.lang.langCode + '"></div>');
				var loader         = $('<div class="feed_loader">' + settings.lang.loading + '</div>');
				var wrapper        = $('<div class="feed_wrapper"></div>');
				var header         = $('<div class="feed_header"></div>');
				var screenName     = $('<h3 class="feed_screen_name"><a href="#" target="_blank"></a></h3>');
				var profileImage   = $('<a href="#" class="feed_profile_image" target="_blank"></a>');
				var content        = $('<div class="feed_content"></div>');
				var showMoreButton = $('<span class="feed_sow_more">' + settings.lang.showMore + '</span>');
				var errorMessage   = $('<div class="error"></div>');
				var retryButton    = $('<span class="retry"></span>');

				header.append(profileImage, screenName);
				wrapper.append(header, content, showMoreButton);
				container.append(loader, wrapper);
				selector.append(container);

				// Main functionality
				var googlePlusFeed = new GoogleFeed(settings.id);

				function initFeed() {
					var feedEntries    = googlePlusFeed.entries;
					var totalPosts     = feedEntries.length;
					var currentPosts   = settings.feedPosts;
					var postsIncrement = settings.postsIncrement;
					var postsLimit     = 0;
					var showMore       = false;
					var i              = 0;
					var j              = currentPosts;
					var str            = '';

					// Check to see if there are enough user posts to show on first load
					currentPosts = totalPosts < currentPosts ? totalPosts : currentPosts;

					if (totalPosts > 0) {
						// Posts exist for the given Google+ ID
						for (; i < currentPosts; i++) {
							str += stringBuilder(i);
						}

						screenName.children('a').attr('href', googlePlusFeed.url).text(googlePlusFeed.screenName);
						profileImage.attr('href', googlePlusFeed.url);
						profileImage.append('<img src="' + googlePlusFeed.image + '" width="' + settings.profileImageSize + '" height="' + settings.profileImageSize + '">');

						// Update feed
						content.html(str);

						// Force scroll to top of content
						content.animate({scrollTop: 0}, 1);

						// Show the content
						wrapper.fadeIn(300);
					} else {
						// No posts exist for the given Google+ ID
						wrapper.children().remove();
						errorMessage.text(settings.lang.errorEmpty);
						retryButton.text(settings.lang.retryEmpty);
						errorMessage.append(retryButton);
						wrapper.append(errorMessage);

						// Show the content
						wrapper.fadeIn(300);

						// Refresh button functionality
						wrapper.find('.retry').click(function() {
							wrapper.children().remove();
							wrapper.append(loader);
							loader.show();

							// Try again
							googlePlusFeed.getFeed();
						});
					}

					// Show more button functionality
					showMoreButton.click(function() {
						if (postsLimit <= totalPosts) {
							postsLimit += showMore ? postsIncrement : currentPosts + postsIncrement;
							postsLimit = postsLimit > totalPosts ? totalPosts : postsLimit;

							for (; j < postsLimit; j++) {
								str += stringBuilder(j);

								if (j === (totalPosts - 1)) {
									showMoreButton.unbind('click').addClass('link');
									showMoreButton.text(settings.lang.viewMore).click(function() {
										window.open(googlePlusFeed.url);
									});
								}
							}

							content.animate({scrollTop: content[0].scrollHeight}, 500);
							showMore = true;
						}

						// Update feed
						content.html(str);
					});


					function stringBuilder(e) {
						// Generates the HTML for each post
						var newStr = '';

						newStr += '<div class="feed_post post_' + (e + 1) + '">';
						newStr += '<span title="' + formatTime(e, true) + '">' + settings.lang.shared + formatTime(e) + '</span>';
						newStr += '<p>' + feedEntries[e].content + '</p>';
						newStr += '<a href="' + feedEntries[e].url + '" target="_blank">' + settings.lang.viewPost + '</a>';
						newStr += '</div>';

						return newStr;
					}

					function formatTime(e, timeFlag) {
						// Generates time strings similar to those that on Goolge+
						timeFlag = timeFlag || false;
						var formattedTime = '';

						var abbreviatedMonths = [
							'Jan', 'Feb', 'Mar',
							'Apr', 'May', 'Jun',
							'Jul', 'Aug', 'Sep',
							'Oct', 'Nov', 'Dec'
						];

						var monthsToNum = [
							'01', '02', '03',
							'04', '05', '06',
							'07', '08', '09',
							'10', '11', '12'
						];

						formattedTime = feedEntries[e].publishedDate.substr(0, 19);

						var dayMonthYear = formattedTime.split('T')[0];

						var year  = dayMonthYear.split('-')[0];
						var month = abbreviatedMonths[monthsToNum.indexOf(dayMonthYear.split('-')[1])];
						var day   = dayMonthYear.split('-')[2];

						var time = formattedTime.split('T').pop();

						dayMonthYear = day + ' ' + month + ' ' + year;

						return timeFlag ? dayMonthYear + ' ' + time : dayMonthYear;
					}
				}

				function GoogleFeed(id) {
					var self = this;
					self.id  = id;
					self.url = 'https://plus.google.com/' + self.id;

					self.init = function() {
						initFeed();
					};

					self.getFeed = function() {
						$.ajax({
							type: 'GET',
							url: 'http://www.kycosoftware.com/api/googleplus-feed/' + self.id,
							dataType: 'json',
							success: function(response) {
								try {
									if (response != '404' && response !== false) {
										var profile  = response.profile;
										var activity = response.activity;

										var getPosts = function(posts) {
											var response      = [];
											var len           = posts.length;
											var i             = 0;
											var validMaxPosts = 0;

											for (; i < len; i++) {
												if (validMaxPosts < settings.maxPosts && posts[i].object.content != '') {
													response.push({
														url: posts[i].object.url,
														publishedDate: posts[i].published,
														content: posts[i].object.content
													});

													validMaxPosts++;
												}
											}

											return response;
										};

										// Find and trim data to fit our needs
										self.screenName = profile.displayName;
										self.entries = getPosts(activity.items);
										self.image = profile.image.url.substr(0, profile.image.url.indexOf('?')) + '?sz=' + settings.profileImageSize;

										// Check if image URL exists, error handling for 404s
										$.get(self.image).fail(function() {
											self.image = 'http://www.kycosoftware.com/images/general/googleplus-404.png';
										}).always(function() {
											// Preload profile image and only show content thereafter
											$('<img src="' + self.image + '">').load(function() {
												loader.fadeOut(300, function() {
													loader.remove();
													self.init();
												});
											});
										});
									} else if (response == '404') {
										loader.fadeOut(300, function() {
											errorMessage.text(settings.lang.errorNotFound);
											wrapper.html(errorMessage);

											// Show the content
											wrapper.fadeIn(300);
										});
									} else {
										loader.fadeOut(300, function() {
											errorMessage.text(settings.lang.errorGeneral);
											wrapper.html(errorMessage);

											// Show the content
											wrapper.fadeIn(300);
										});
									}
								} catch (error) {
									loader.fadeOut(300, function() {
										wrapper.children().remove();
										errorMessage.text(settings.lang.errorGeneral);
										retryButton.text(settings.lang.retryGeneral);
										errorMessage.append(retryButton);
										wrapper.append(errorMessage);

										// Show the content
										wrapper.fadeIn(300);

										// Retry button functionality
										wrapper.find('.retry').click(function() {
											wrapper.children().remove();
											wrapper.append(loader);
											loader.show();

											// Try again
											self.getFeed();
										});
									});
								}
							}
						});
					};

					self.getFeed();
				}
			});
		}
	};

	$.fn.kycoGooglePlusFeed2 = function(method) {
		// Check if browser supports Array.forEach() method, if it doesn't mimic that functionality,
		// implementation from here: http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc
		if (!('forEach' in Array.prototype)) {
			Array.prototype.forEach = function(action, that /*opt*/) {
				for (var i = 0, n = this.length; i < n; i++) {
					if (i in this) {
						action.call(that, this[i], i, this);
					}
				}
			};
		}

		if (typeof method === 'string') {
			method = {
				id: method
			};
		}

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.kycoGooglePlusFeed2');
		}
	};
})(jQuery);

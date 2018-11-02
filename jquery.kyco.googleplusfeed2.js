/*
**
**  jquery.kyco.googleplusfeed2
**  ===========================
**
**  Version 2.1.4
**
**  Brought to you by
**  https://kyco.io
**
*/

'use strict';

(function($) {
  var methods = {
    init: function(options) {
      var defaults = {
        feedPosts        : 3,       // Feed posts to show on load
        postsIncrement   : 3,       // Number of feed posts to show on "Show more" button click
        maxPosts         : 20,      // Max number of posts to pull before "Show more" will go to Google+, cannot exceed 20 because of Google API
        profileImageSize : 50,      // Max size is 250
        fadeSpeed        : 250,     // Fade-in animation duration
        loadAttachments  : true,    // Load images, videos, links and other attachments into feed?
        orderBy          : 'date',  // Either 'date' or 'popularity'
        sort             : 'asc',   // Either 'asc' or 'desc'
        lang             : 'en'     // Default language, can also be set to 'de'
      };

      var settings = $.extend({}, defaults, options);

      return this.each(function() {
        var selector = $(this);
        var container, loader, wrapper, header, screenName, profileImage,
            content, showMoreButton, errorMessage, retryButton, googlePlusFeed;

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
          retryGeneral  : 'Retry',
          originalShare : 'originally shared',
          viewVideo     : 'View video at original URL'
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
          retryGeneral  : 'Wiederholen',
          originalShare : 'ursprünglich geteilt',
          viewVideo     : 'Video Blick in Original URL'
        };

        // Create feed DOM elements.
        container      = $('<div id="feed_' + selector.attr('class') + '" class="kyco_googleplusfeed ' + settings.lang.langCode + '"></div>');
        loader         = $('<div class="feed_loader">' + settings.lang.loading + '</div>');
        wrapper        = $('<div class="feed_wrapper"></div>');
        header         = $('<div class="feed_header"></div>');
        screenName     = $('<h3 class="feed_screen_name"><a href="#" target="_blank"></a></h3>');
        profileImage   = $('<a href="#" class="feed_profile_image" target="_blank"></a>');
        content        = $('<div class="feed_content"></div>');
        showMoreButton = $('<span class="feed_show_more">' + settings.lang.showMore + '</span>');
        errorMessage   = $('<div class="error"></div>');
        retryButton    = $('<span class="retry"></span>');

        header.append(profileImage, screenName);
        wrapper.append(header, content, showMoreButton);
        container.append(loader, wrapper);
        selector.append(container);

        function GoogleFeed(id) {
          var self = this;

          self.id  = id;
          self.url = 'https://plus.google.com/' + self.id;

          self.init = function() {
            var feedEntries    = googlePlusFeed.entries;
            var totalPosts     = feedEntries.length;
            var currentPosts   = settings.feedPosts;
            var postsIncrement = settings.postsIncrement;
            var postsLimit     = 0;
            var showMore       = false;
            var i              = 0;
            var j              = currentPosts;
            var str            = '';

            function formatTime(e, timeFlag) {
              // Generates time strings similar to those that on Goolge+
              var flag = timeFlag || false;
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
              var dayMonthYear, day, month, year, time;

              formattedTime = feedEntries[e].publishedDate.substr(0, 19);
              dayMonthYear  = formattedTime.split('T')[0];
              year          = dayMonthYear.split('-')[0];
              month         = abbreviatedMonths[monthsToNum.indexOf(dayMonthYear.split('-')[1])];
              day           = dayMonthYear.split('-')[2];
              time          = formattedTime.split('T').pop();
              dayMonthYear  = day + ' ' + month + ' ' + year;

              return flag ? dayMonthYear + ' ' + time : dayMonthYear;
            }

            function stringBuilder(e) {
              // Generates the HTML for each post
              var markup = '';
              var albumMarkup = '';
              var attachmentMarkup = '';
              var x, y, q, r;

              if (settings.loadAttachments && typeof feedEntries[e].attachments !== 'undefined') {
                for (x = 0, y = feedEntries[e].attachments.length; x < y; x++) {
                  albumMarkup = '';

                  switch (feedEntries[e].attachments[x].objectType) {
                    case 'photo':
                      attachmentMarkup += '' +
                      '<p class="attachment photo">' +
                        '<a href="' + feedEntries[e].attachments[x].url + '" target="_blank" title="View photo">' +
                          '<img width="100%" src="' + feedEntries[e].attachments[x].image.url + '">' +
                        '</a>' +
                      '</p>';
                      break;

                    case 'album':
                      for (q = 0, r = feedEntries[e].attachments[x].thumbnails.length; q < r; q++) {
                        albumMarkup += '' +
                        '<a href="' + feedEntries[e].attachments[x].thumbnails[q].url + '" target="_blank" title="View album">' +
                          '<img width="100%" src="' + feedEntries[e].attachments[x].thumbnails[q].image.url + '">' +
                        '</a>';
                      }
                      attachmentMarkup += '' +
                      '<p class="attachment album">' +
                        albumMarkup +
                      '</p>';
                      break;

                    case 'article':
                      if (feedEntries[e].attachments[x].fullImage) {
                        attachmentMarkup += '' +
                        '<p class="attachment photo">' +
                          '<a href="' + feedEntries[e].attachments[x].url + '" target="_blank" title="View article">' +
                            '<img width="100%" src="' + feedEntries[e].attachments[x].fullImage.url + '">' +
                          '</a>' +
                        '</p>';
                      } else {
                        attachmentMarkup += '' +
                        '<p class="attachment article">' +
                          '<a href="' + feedEntries[e].attachments[x].url + '" target="_blank" title="View article">' +
                            '<span title="' + feedEntries[e].attachments[x].displayName + '">' + feedEntries[e].attachments[x].displayName + '</span>' +
                            '<small title="' + feedEntries[e].attachments[x].url + '">' + feedEntries[e].attachments[x].url + '</small>' +
                          '</a>' +
                        '</p>';
                      }
                      break;

                    case 'video':
                      if (typeof feedEntries[e].attachments[x].embed !== 'undefined') {
                        attachmentMarkup += '' +
                        '<p class="attachment video">' +
                          '<iframe width="100%" scrolling="no" src="' + feedEntries[e].attachments[x].embed.url + '"></iframe>' +
                          '<a href="' + feedEntries[e].attachments[x].url + '" target="_blank" title="View video">' +
                            settings.lang.viewVideo +
                          '</a>' +
                        '</p>';
                      } else {
                        attachmentMarkup += '' +
                        '<p class="attachment photo">' +
                          '<a href="' + feedEntries[e].attachments[x].url + '" target="_blank" title="View video">' +
                            '<img width="100%" src="' + feedEntries[e].attachments[x].image.url + '">' +
                          '</a>' +
                        '</p>';
                      }
                      break;
                    // no default
                  }
                }
              }

              if (typeof feedEntries[e].annotation !== 'undefined') {
                markup += '' +
                '<div class="feed_post post_' + (e + 1) + '">' +
                  '<span title="' + formatTime(e, true) + '">' + settings.lang.shared + formatTime(e) + '</span>' +
                  '<p>' + feedEntries[e].annotation + '</p>' +
                  '<div class="original">' +
                    '<p class="original">' +
                      feedEntries[e].originalPoster.displayName +
                      ' <span>' + settings.lang.originalShare + ':</span>' +
                    '</p>' +
                    attachmentMarkup +
                    '<p>' + feedEntries[e].content + '</p>' +
                  '</div>' +
                  '<a href="' + feedEntries[e].url + '" target="_blank">' + settings.lang.viewPost + '</a>' +
                '</div>';
              } else {
                markup += '' +
                '<div class="feed_post post_' + (e + 1) + '">' +
                  '<span title="' + formatTime(e, true) + '">' + settings.lang.shared + formatTime(e) + '</span>' +
                  attachmentMarkup +
                  '<p>' + feedEntries[e].content + '</p>' +
                  '<a href="' + feedEntries[e].url + '" target="_blank">' + settings.lang.viewPost + '</a>' +
                '</div>';
              }

              return markup;
            }

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
              wrapper.fadeIn(settings.fadeSpeed);
            } else {
              // No posts exist for the given Google+ ID
              wrapper.children().remove();
              errorMessage.text(settings.lang.errorEmpty);
              retryButton.text(settings.lang.retryEmpty);
              errorMessage.append(retryButton);
              wrapper.append(errorMessage);

              // Show the content
              wrapper.fadeIn(settings.fadeSpeed);

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
              var goToGooglePlus = function() {
                window.open(googlePlusFeed.url);
              };

              if (postsLimit <= totalPosts) {
                postsLimit += showMore ? postsIncrement : currentPosts + postsIncrement;
                postsLimit = postsLimit > totalPosts ? totalPosts : postsLimit;

                for (; j < postsLimit; j++) {
                  str += stringBuilder(j);

                  if (j === totalPosts - 1) {
                    showMoreButton.unbind('click').addClass('link');
                    showMoreButton.text(settings.lang.viewMore).click(goToGooglePlus);
                  }
                }

                content.animate({scrollTop: content[0].scrollHeight}, 500);
                showMore = true;
              }

              // Update feed
              content.html(str);
            });
          };

          self.getFeed = function() {
            $.ajax({
              type: 'GET',
              url: 'https://www.kycosoftware.com/api/googleplus-feed/' + encodeURIComponent(self.id),
              dataType: 'json',
              success: function(response) {
                var profile, activity, getPosts;

                try {
                  if (response !== '404' && response !== false) {
                    profile  = response.profile;
                    activity = response.activity;

                    getPosts = function(posts) {
                      var innerResponse = [];
                      var len           = posts.length;
                      var i             = 0;
                      var validMaxPosts = 0;

                      for (; i < len; i++) {
                        if (validMaxPosts < settings.maxPosts && posts[i].object.content !== '') {
                          innerResponse.push({
                            url            : posts[i].object.url,
                            publishedDate  : posts[i].published,
                            content        : posts[i].object.content,
                            annotation     : posts[i].annotation,
                            attachments    : posts[i].object.attachments,
                            plusones       : posts[i].object.plusoners.totalItems,
                            originalPoster : posts[i].object.actor
                          });
                          validMaxPosts++;
                        }
                      }

                      switch (settings.orderBy) {
                        case 'date':
                          if (settings.sort === 'asc') {
                            innerResponse.sort(function(a, b) {
                              return new Date(b.publishedDate) - new Date(a.publishedDate);
                            });
                          } else {
                            innerResponse.sort(function(a, b) {
                              return new Date(b.publishedDate) - new Date(a.publishedDate);
                            });
                          }
                          break;
                        case 'popularity':
                          if (settings.sort === 'asc') {
                            innerResponse.sort(function(a, b) {
                              return b.plusones - a.plusones;
                            });
                          } else {
                            innerResponse.sort(function(a, b) {
                              return a.plusones - b.plusones;
                            });
                          }
                          break;
                        // no default
                      }

                      return innerResponse;
                    };

                    // Find and trim data to fit our needs
                    self.screenName = profile.displayName;
                    self.entries = getPosts(activity.items);
                    self.image = profile.image.url.substr(0, profile.image.url.indexOf('?')) + '?sz=' + settings.profileImageSize;

                    // Check if image URL exists, error handling for 404s
                    $.get(self.image).fail(function() {
                      self.image = 'https://www.kycosoftware.com/images/general/googleplus-404.png';
                    }).always(function() {
                      // Preload profile image and only show content thereafter
                      $('<img src="' + self.image + '">').on('load', function() {
                        loader.fadeOut(settings.fadeSpeed, function() {
                          loader.remove();
                          self.init();
                        });
                      });
                    });
                  } else if (response === '404') {
                    loader.fadeOut(settings.fadeSpeed, function() {
                      errorMessage.text(settings.lang.errorNotFound);
                      wrapper.html(errorMessage);

                      // Show the content
                      wrapper.fadeIn(settings.fadeSpeed);
                    });
                  } else {
                    loader.fadeOut(settings.fadeSpeed, function() {
                      errorMessage.text(settings.lang.errorGeneral);
                      wrapper.html(errorMessage);

                      // Show the content
                      wrapper.fadeIn(settings.fadeSpeed);
                    });
                  }
                } catch (error) {
                  loader.fadeOut(settings.fadeSpeed, function() {
                    wrapper.children().remove();
                    errorMessage.text(settings.lang.errorGeneral);
                    retryButton.text(settings.lang.retryGeneral);
                    errorMessage.append(retryButton);
                    wrapper.append(errorMessage);

                    // Show the content
                    wrapper.fadeIn(settings.fadeSpeed);

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

        // Main functionality
        googlePlusFeed = new GoogleFeed(settings.id);
      });
    }
  };

  $.fn.kycoGooglePlusFeed2 = function(method) {
    var _method = method;

    if (typeof method === 'string') {
      _method = {id: method};
    }

    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof _method === 'object') {
      return methods.init.apply(this, [_method]);
    }

    return $.error('Method ' + method + ' does not exist on jQuery.kycoGooglePlusFeed2');
  };
})(jQuery);

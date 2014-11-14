kyco Google+ Feed 2
===================
####Version: 2.0.4

The best Google+ feed widget out there!

Take a look at the [demo](http://www.kycosoftware.com/projects/demo/googleplus-feed-widget-2).

How to install
--------------

Bower: `bower install jquery.kyco.googleplusfeed2 -D`

Manual: Download or clone and include the minified js file after including jquery:

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
	<script src="jquery.kyco.googleplusfeed2.min.js"></script>

For default styling include the CSS file and loader.gif from the src directory:

	<link rel="stylesheet" href="jquery.kyco.googleplusfeed2.css">

Create a div to hold the feed and then pull the feed into it by calling the 
kycoGooglePlusFeed2 method on it with the specified Google+ ID:

	<div class="mydiv"></div>
	
	<script>
		$(document).ready(function() {
			$('.mydiv').kycoGooglePlusFeed2('116899029375914044550');
		});
	</script>

What a customisation looks like:

	<div class="mydiv2"></div>
	
	<script>
		$(document).ready(function() {
			$('.mydiv2').kycoGooglePlusFeed2({
				id: '116899029375914044550',
				feedPosts: 2,
				postsIncrement: 1,
				maxPosts: 5,
				profileImageSize: 150,
				sort: 'asc',
				lang: 'de'
			});
		});
	</script>


Configuration - kycoGooglePlusFeed2({ *options* })
--------------------------------------------------

	id: /* Google+ ID */,

The Google+ ID used to generate the feed.

	feedPosts: 3,

Feed posts to show on load.

	postsIncrement: 3,

Number of feed posts to show on "Show more" button click.

	maxPosts: 20,

Max number of posts to pull before "Show more" will go to Google+, cannot exceed 20 
because of Google API in use.

	profileImageSize: 50,

Image size of the profile image, max size is 250. Also adjust CSS if changing the default.

	orderBy: 'date'

Order posts by 'date' or 'popularity'.

	sort: 'asc',

Sort order of the orderBy parameter. Default is 'asc' (i.e. latest or most popular posts first) can be set to 'desc'.

	lang: 'en'

Default language is English, can also be set to German - 'de'.


Styling
-------

By default you will have to include the loader image if you want
a spinner to appear while the feed is loading.


Privacy Policy
--------------

View the [Privacy Policy](https://github.com/kyco/jquery.kyco.googleplusfeed2/wiki/Privacy-Policy).


Support
-------

For bugs or improvements please use the [issues tab](https://github.com/kyco/jquery.kyco.googleplusfeed2/issues)
or email [support@kycosoftware.com](mailto:support@kycosoftware.com).

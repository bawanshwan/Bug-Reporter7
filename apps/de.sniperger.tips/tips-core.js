br8.initTips = function() {
	var lang = navigator.language.slice(0,2) || navigator.userLanguage.slice(0,1);
	var device = ((window.innerWidth >= 768)) ? "ipad" : "iphone";

	$.getJSON("http://help.apple.com/ios/tips/8/"+device+"/"+lang+"/feed.json", function(data) {
	var image;
		fw7.hideIndicator();
		$('div.page[data-page="tips-content"] div.slider-wrapper').html();
		$.each(data.tips, function(index) {
			var el = this;
			image = ((window.innerWidth >= 768)) ? this.image : this.image.replace(/D1/g, "D2");
			$('div.page[data-page="tips-content"] div.slider-wrapper').append('<div class="slider-slide"><div class="image-wrapper"><img class="tips-img" src="http://help.apple.com/ios/tips/8/'+device+'/'+lang+'/'+image+'"/></div><div class="tips-content-scroll"><p class="tips-title">'+this.title+'</p><p class="tips-content">'+ this.text +'</p></div></div>');
			if (this.html && this.text === undefined) {
				$('div.page[data-page="tips-content"] div.slider-wrapper div.slider-slide:last-child p.tips-content').html(this.html);
			}
		});
		$('div.page[data-page="tips-content"] div.slider-wrapper').append('<div class="slider-slide"><img src="http://help.apple.com/ios/tips/8/ipad/'+lang+'/'+image+'" /></div>');
		console.log(image);
		
		var slider = fw7.slider(".slider-container", {
			paginationHide: true,
			pagination: '.slider-pagination',
		});
	});
};

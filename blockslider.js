/*
 * blockslider.js - v0.1 - simple horitonal slider UI - jquery plugin - MIT license
 * Author: Jim Palmer
 */
(function ($) {
	$.fn.blockslider = function (options) {
		// if numeric argument, not object, move the cursor
		if (typeof options === 'number') {
			return this.each(function () {
				moveCursorTo(this, options);
			});
		}
		// initialize: iterate through selected items - chainable
		return this.each(function () {
			
			var target = this,
				opts = $.extend({
					// initial position of the cursor - index of block
					initPosition: 1,
					// enable click events being attached to blocks
					enableBlockClick: true,
					// prevent cursor and callback being run if pos is same as current pos
					disableDuplicatePos: true,
					// callback function after cursor is moved
					moveCursorToCallback: function (pos) { }
				}, options || {});
			
			// store the options for each selected element
			$(target).data('blockslider.opts', opts);
			
			// drag-drop support
			$('.cursor', target).unbind('mousedown.blockslider')
				.bind('mousedown.blockslider', {target:target}, function (e) {
					clearEvents(e);
					var guide = $('.guide', e.data.target),
						lbound = guide.offset().left,
						rbound = lbound + guide.outerWidth();
					$(document).unbind('mousemove.blockslider').bind('mousemove.blockslider', {
								target: e.data.target,
								lbound: lbound,
								rbound: rbound
							}, function (e) {
						clearEvents(e);
						// check within bounds
						if (e.pageX > e.data.lbound && e.pageX < e.data.rbound ) {
							// step in X axis
							var pos = Math.floor(
								(e.pageX - e.data.lbound) / 
								$('.cursor', e.data.target).outerWidth());
							moveCursorTo(e.data.target, pos);
						}
					});
					// add drag css class to cursor
					$(this).addClass('cursorDrag');
					// clear drag-drop sliding event handler
					$(document).unbind('mouseup.blockslider')
						.bind('mouseup.blockslider', {cursor:this}, function (e) {
							clearEvents(e);
							$(e.data.cursor).removeClass('cursorDrag');
							$(document).unbind('mousemove.blockslider mouseup.blockslider');
						});
				// add the hover for the cursor
				}).unbind('mouseover.blockslider mouseout.blockslider')
				.bind('mouseover.blockslider mouseout.blockslider',  function (e) { 
					$(this).toggleClass('cursorHover');
				});
			
			// guide click location
			$('.guide', target).unbind('click.blockslider')
				.bind('click.blockslider', {target:target}, function (e) {
					var cursor = $('.cursor', e.data.target),
						curWidth = cursor.outerWidth(),
						lbound = $(this).offset().left,
						rbound = lbound + $(this).width();
					if (e.pageX > lbound && e.pageX < rbound ) {
						var pos = Math.floor((e.pageX - lbound) / curWidth);
						moveCursorTo(e.data.target, pos);
					}
				});
			
			// specific block click location
			$('.block:not(.divider)', target).each(function (i) {
				$(this).unbind('click.blockslider')
					.bind('click.blockslider', {target:target}, function (e) {
						moveCursorTo(e.data.target, i);
					}).mousedown(function (e) {
						clearEvents(e);
					});
			})
			.unbind('mouseover.blockslider mouseout.blockslider')
			.bind('mouseover.blockslider mouseout.blockslider', function () {
				$(this).toggleClass('blockHover');
			});
			
			// intialize the cursor
			moveCursorTo(target, opts.initPosition);
			
		});
	};
	function moveCursorTo (target, pos) {
		var opts = $(target).data('blockslider.opts') || {};
		// check valid range in blocks
		if (pos < 0 || pos >= ($('.block:not(.divider)', target).length - 0))
			return true; // continue
		// duplicate the position click if already current position?
		if (opts.disableDuplicatePos && pos === opts.currPos)
			return true; // continue
		// select slider hour block
		$('.blockSelected', target).removeClass('blockSelected');
		$('.block:not(.divider):eq(' + pos + ')', target).addClass('blockSelected');
		var cursor = $('.cursor', target),
			cursorWidth = cursor.outerWidth();
		cursor.css('margin-left', (pos * cursorWidth));
		opts.currPos = pos;
		$(target).data('blockslider.opts', opts);
		if (typeof opts.moveCursorToCallback === 'function')
			opts.moveCursorToCallback(pos);
	};
	function clearEvents (e) {
		// prevent drag text selection of hour blocks
		document.selection && document.selection.empty();
		window.getSelection && window.getSelection().removeAllRanges();
		e.preventDefault && e.preventDefault();
		e.stopPropagation && e.stopPropagation();
	}
})(jQuery);
/* 
  olark-popup.js

  Oldschool HTML popup window for Olark.

  license: MIT-style

  Copyright 2010 Gilbert Guttmann (http://gttmnn.com). All rights reserved.
  
*/

var OlarkPopup = {
	
	init: function(){
		OlarkPopup.refresh();
		
		olark.extend(function(api){
			api.chat.updateVisitorNickname({
				snippet: visitorNickname,
				hidesDefault: true
			});
			
			api.chat.updateVisitorStatus({ snippet: visitorStatus });
			
			api.chat.onMessageToVisitor(function(event){
				OlarkPopup.update('operator', event.message.nickname, event.message.body);
				
				OlarkPopup.setOperatorText('You are chatting with ' + event.message.nickname);
			});
			
			api.chat.onMessageToOperator(function(event){
				OlarkPopup.update('visitor', visitorNickname, event.message.body);
			});
			
			api.chat.onOperatorsAvailable(function(){
				OlarkPopup.changeStatus('online');
			});
			
			api.chat.onOperatorsAway(function(){
				OlarkPopup.changeStatus('offline');
			});
			
			api.chat.onOperatorsBusy(function(){
				OlarkPopup.changeStatus('offline');
			});
			
			if (api.chat.operatorsAreAway()) OlarkPopup.setOffline();
				
			api.chat.onReady(function(){
				OlarkPopup.buildChatLog();
			});
		
			api.box.onHide(function(event){
				$('#habla_window_div, .habla_window_div_base').css({
					display: 'none',
					bottom: '-1000px'
				});
			});
			
			api.box.hide();

			$('form').submit(function(event){
				event.preventDefault();
				
				$('#habla_chatform_form').find('textarea').val(jQuery.trim($(this).find('input').val())).submit();
				
				api.box.shrink();
				api.box.hide();
				
				$(this).find('input').val('').focus();
			});
		});
	},
	
	start: function(){
		$('form input').data('default', $('form input').val()).focus(function(){
			if ($(this).val() == $(this).data('default')) $(this).val('');
		});
		
		$('form input').blur(function(){
			if ($(this).val() == '') $(this).val($(this).data('default'));
		});
		
		OlarkPopup.refresh();
	},
	
	update: function(type, nickname, message){
		var message = OlarkPopup.parseMessage(message);
		
		if (type == $('#log dl:last').attr('class')) {
			/* Add to existing container */
			
			$('<dd>' + message + '</dd>').appendTo($('#log dl:last'))
		} else {
			/* Create new container */

			$('#skeleton').clone().appendTo($('#log')).addClass(type).removeAttr('id').find('dd').html(message).end().fadeIn();
			
			var avatar = $('#avatars img[alt="' + jQuery.trim(nickname.split('(')[0]) + '"]:first');
			
			if (avatar.length == 1) $('dl:last img').attr('src', avatar.attr('src'));
		}
		
		OlarkPopup.refresh();
	},
	
	buildChatLog: function(){
		$('.habla_conversation_p_item').each(function(){
			if ($(this).find('.hbl_pal_remote_fg').length > 0) {
				var type 			= 'operator';
				var nickname 	= jQuery.trim($(this).find('.hbl_pal_remote_fg').text().replace(':', ''));
				
				OlarkPopup.setOperatorText('You are chatting with ' + nickname);
			} else {
				var type 			= 'visitor';
				var nickname 	= visitorNickname;
			}
				
			OlarkPopup.update(type, nickname, $(this).find('.hbl_pal_main_fg').text());
		});
		
		OlarkPopup.start();
	},
	
	setOperatorText: function(message){
		$('#operator-status').text(message);
	},
	
	changeStatus: function(status){
		switch(status){
			case 'online':
				$('#status-message').hide();
				$('#operator-status, #log, form').show();
			break;
			case 'offline':
				$('#status-message').show();
				$('#operator-status, #log, form').hide();

				$('#operator-status').text('Waiting for an operator to respond.');
				$('#status-message').attr('class', 'unavailable').find('span').text('Chat is currently unavailable, please come back later.');
			break;
		}
	},
	
	parseMessage: function(message){
		var regex = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;

		return message.replace(regex, '<a href="$1" target="_blank">$1</a>');
	},
	
	refresh: function(){
		var scroll = 0;
		
		$('#log dl').each(function(){
			scroll += $(this).height();
		});
		
		$('#log').css('height', $(window).height() - $('form').outerHeight() - $('#operator-status').outerHeight()).scrollTop(scroll + 1000);
	}

}

$(document).ready(OlarkPopup.init);
$(window).resize(OlarkPopup.refresh);
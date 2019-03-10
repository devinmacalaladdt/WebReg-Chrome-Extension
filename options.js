$(function(){

	chrome.storage.sync.get('checked_list', function(obj) {
		if(jQuery.isEmptyObject(obj)) 
			return;
		items = obj["checked_list"].split(';');
		for(i = 0;i < items.length - 1;i++) {
			$('#' + items[i]).attr("checked", true);
		}
	});

	$("#save_button").click(function(){

		var checked_list = "";
		var campus_bool = false;
		var online_bool = false;

		$("input[type=checkbox]").each(function(){

			if($(this).prop("checked")==true){


				var temp = $(this).attr("id");
				checked_list+= temp+";";
				if($(this).attr("id").startsWith("online")){

					online_bool = true;

				}else if($(this).attr("id").startsWith("campus")){

					campus_bool = true;

				}

			}



		});

		if(online_bool==true && campus_bool==true){

			alert("You cannot select online and on campus classes at the same time! Please deselect one.");
			return;

		}

		chrome.storage.sync.set({"checked_list":checked_list},function(){

			close();

		});

	});

});
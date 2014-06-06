var schwarzwald = schwarzwald || {};

schwarzwald.api = {
	post:function(endpoint, payload, completionFunc, errFunc){
		ajax.asyncPost(schwarzwald.config.apiBase+endpoint+"/", JSON.stringify(payload), function(request){
			if(request.status!=200){
				errFunc("Data fetch returned HTTP "+request.status);
			}
			else{
				try{
					var data=JSON.parse(request.responseText);
				}
				catch(e){
					errFunc("Failed to parse Response: "+e.message);
					return;
				}
				if(data.code!=200){
					errFunc(data.message);
					return;
				}
				completionFunc(data);
			}
		}, function(error){
			errFunc(error.message);
		}, "application/json");	
	},

	fetch:function(payload, completionFunc, errFunc){
		schwarzwald.api.post("fetch", payload, completionFunc, errFunc);
	},
	
	fetchLectures:function(completionFunc, errFunc){
		schwarzwald.api.fetch({"content":"lectures"}, completionFunc, errFunc);
	},

	fetchProfessors:function(completionFunc, errFunc){
		schwarzwald.api.fetch({"content":"professors"}, completionFunc, errFunc);
	},

	search:function(filters, completionFunc, errFunc){
		schwarzwald.api.post("search", {"filters":filters}, completionFunc, errFunc);
	}
};

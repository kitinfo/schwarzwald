var schwarzwald = schwarzwald || {};

schwarzwald.api = {
	fetch:function(payload, completionFunc, errFunc){
		ajax.asyncPost(schwarzwald.config.apiEndpoint+"?fetch", JSON.stringify(payload), function(request){
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
				completionFunc(data);
			}
		}, function(error){
			errFunc(error.message);
		}, "application/json");	
	},
	
	fetchLectures:function(completionFunc, errFunc){
		schwarzwald.api.fetch({"content":"lectures"}, completionFunc, errFunc);
	},

	fetchProfessors:function(completionFunc, errFunc){
		schwarzwald.api.fetch({"content":"professors"}, completionFunc, errFunc);
	},

	fetchResults:function(type, filter, completionFunc, errFunc){
		schwarzwald.api.fetch({"content":type, "filter":filter}, completionFunc, errFunc);
	}
};

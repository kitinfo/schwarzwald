var schwarzwald={
	fetchStatic:function(){
		schwarzwald.api.fetchLectures(function(data){schwarzwald.gui.setDataList(schwarzwald.gui.dom.datalists.lectures, data.content)}, schwarzwald.log.status);
		schwarzwald.api.fetchProfessors(function(data){schwarzwald.gui.setDataList(schwarzwald.gui.dom.datalists.professors, data.content)}, schwarzwald.log.status);
	},
	
	init:function(){
		schwarzwald.fetchStatic();
	},
	
	/**
	* Submit a search, specified by /filters/
	*/
	search: function() {
		var filters=[];
		//Valid filter ops:
		//text
		//and
		//or
		//professor
		//type
		//from
		//until
		//limit

		//Temporal filtering
		filters.push({"op":"from","param":schwarzwald.gui.dom.filters.from.value});
		filters.push({"op":"until","param":schwarzwald.gui.dom.filters.until.value});

		//Result limit
		filters.push({"op":"limit","param":schwarzwald.gui.dom.filters.limit.value});

		//Type filter
		filters.push({"op":"type","param":schwarzwald.gui.dom.filters.type.value});

		//Professor
		filters.push({"op":"professor","param":schwarzwald.gui.dom.filters.prof.value});
		
		//Text search
		filters.push({"op":"text","param":schwarzwald.gui.dom.filters.text.value});

		filterElements=schwarzwald.gui.dom.filters.textElements;
		for(var i=0;i<filterElements.length;i++){
			var filterText=filterElements[i].getElementsByTagName("input")[0].value;
			var filterOp=filterElements[i].getElementsByTagName("select")[0].value;
			filters.push({"op":filterOp, "param":filterText});
		}

		//Remove empty filters
		for(var i=filters.length-1;i>=0;i--){
			if(!filters[i].param){
				filters.splice(i,1);
			}
		}

		//process
		console.log(JSON.stringify(filters));
		schwarzwald.api.search(filters, debug.dump, schwarzwald.log.status);
	}
};

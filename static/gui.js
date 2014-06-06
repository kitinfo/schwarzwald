var schwarzwald = schwarzwald || {};

schwarzwald.gui = {
	buildNode:function(tag, text, attributes){
		var node=document.createElement(tag);
		if(text){
			node.textContent=text;
		}

		if(attributes){
			for(attrib in attributes){
				node.setAttribute(attrib, attributes[attrib]);
			}
		}

		return node;
	},

	setDataList:function(listNode, data){
		listNode.innerHTML="";
		data.forEach(function(e){
			listNode.appendChild(schwarzwald.gui.buildNode("option", undefined, {"value":e}));
		});
	}
};

schwarzwald.gui.dom = {
	statusDisplay:document.getElementById("status")
};

schwarzwald.gui.dom.filters = {
	text:document.getElementById("searchInput0"),
	textElements:document.getElementsByClassName("searchInput"),
	limit:document.getElementById("limitInput"),
	type:document.getElementById("select-mode"),
	prof:document.getElementById("profInput"),
	from:document.getElementById("oldest"),
	until:document.getElementById("newest")
};

schwarzwald.gui.dom.datalists = {
	lectures:document.getElementById("lecturesList"),
	professors:document.getElementById("profList")
};

var debug = {
	stringify:function(a){
		console.log("["+(typeof a)+"] "+JSON.stringify(a));
	},

	dump:function(){
		for(var i=0; i<arguments.length; i++){
			debug.stringify(arguments[i]);
		}
	}
}

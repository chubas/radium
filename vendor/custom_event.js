Class('CustomEvent')({
	type      : '',
	target    : null,
	_stop     : false,
	prototype : {
		init : function(type, data){
			this.type = type;
			$.extend(this, data);
		},
		stopPropagation : function(){
			this._stop = true;
		},
		preventDefault : function(){
			this._preventDefault = true;
		}
	}
});

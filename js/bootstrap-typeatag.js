!function( $ ){
	"use strict"

	var Typeatag = function ( element, options ) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeatag.defaults, options)
    
    this.tagplace = this.$element.parent().find(this.options.tagplace);
    
	  if(this.tagplace.length == 0 ) {
	  	$('<span/>').addClass('help-block').insertAfter(this.$element)
	  }

		this.messageplace = this.$element.parent().find(this.options.messageplace);
	  if(this.messageplace.length == 0 ) {
	  	$('<span/>').addClass('help-inline').insertAfter(this.$element)
	  }
	   
	  if(this.messageplace.find('.message').length == 0 ) {
	  	$('<span/>').addClass('message add-on').appendTo(this.messageplace)
	  }
		this.message = this.messageplace.find('.message').hide();
	  this.tagInput = $('<input/>').addClass('tag-input').attr('hidden',true).attr('name',this.$element.attr('name')).appendTo(this.tagplace)
		this.listen()
  }

  Typeatag.prototype = {

  	constructor: Typeatag
  	, listen : function () {
  		var that = this;
  		this.$element.typeahead({
				source: function (query, callback) {
				 	if(that.options.min > query.length) return false
				 	var queryVars = {}
				 			queryVars[that.options.queryName] = query
				 	that.options.getSource($.extend(queryVars, that.options.additionalParams), callback)
				},
				onselect: function(tag) { 
					that.$element.attr('value', '')
					if(!that.checkUnique(tag) && that.options.unique) return
	
					that.createTag(tag).appendTo(that.$element.siblings(that.options.tagplace))
					that.checkLimit(that.$element)
				},
				property: "name"	
			})
  	}
  	, getSource : function(queryVars, callback) {
			$.get(path, queryVars, function (data) {
	      callback(data)
	    },'json')
		}
		, getTags : function() {
			return this.tagInput.val().length > 0 ? this.tagInput.val().split('|') : []
		}
		, setTags : function(tags) {
			this.tagInput.val(tags.join('|'))
		}
		, createTag : function(tag) {
			var that = this;
			var label = $('<span/>').addClass('label label-info tag span').html(tag.name)
					label.attr('data-tag', JSON.stringify(tag))
			var remove = $('<a/>').attr('href','#').appendTo(label)
			var tags = this.getTags()
			tags.push(this.getTagPropertyId(tag))
			this.setTags(tags)
			remove.click(function(e) {
				e.preventDefault()
				var tag = $(this).parent('.tag').data('tag')
				that.setTags(jQuery.grep(that.getTags(), function(value) {
				  return value != that.getTagPropertyId(tag)
				}))
				$(this).parent('.tag').remove()
				that.checkLimit()
			})
			$('<i/>').addClass('icon-remove icon-white').appendTo(remove)
			return label
		}
		, getTagPropertyId : function(tag) {
			var tagProperty = this.options.property
			if(typeof tag[this.options.propertyId] != undefined) {
				tagProperty = this.options.propertyId
			}
			return tag[tagProperty]
		}
		, checkUnique : function (tag) {
			var that = this,flag = true
			$.each($(this.options.tagplace).find('.tag'), function (i,v) {
				if(that.getTagPropertyId($(this).data('tag')) == that.getTagPropertyId(tag)){
					flag = false
					return
				}
			})
			return flag
		}
		, checkLimit : function() {
			if(this.getTags().length >= this.options.limit) {
  			this.$element.attr('disabled', true)
  			this.message.html(this.options.messages.limit).show()
  		}else{
  			this.$element.attr('disabled', false)
  			this.message.hide()
  		}
		}
		, select : function () {
			this.$element.typeahead('select')
		}
  }

  /* TYPEATAG PLUGIN DEFINITION
   * =========================== */
  $.fn.typeatag = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeatag')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeatag', (data = new Typeatag(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeatag.defaults = {
    'tagplace' : '.help-block', 
		'messageplace' : '.help-inline',
		'messages' : {
			'limit': 'Tag limit reached'
		},
		'unique': true,
  	'limit' : 3,
  	'propertyId' : 'id',
  	'queryName' : 'query',
  	'additionalParams' : {},
  	'min' : 2,
  	'getSource' : function(queryVars, callback) {
			$.get(this.path, queryVars, function (data) {
	      callback(data)
	    },'json')
		}
  	, 'path' : ''
  }

  $.fn.typeatag.Constructor = Typeatag

  /* TYPEATAG DATA-API
  * ================== */

  $(function () {
    $('body').on('focus.typeatag.data-api', '[data-provide="typeatag"]', function (e) {
      var $this = $(this)
      if ($this.data('typeatag')) return
      e.preventDefault()
      $this.typeatag($this.data())
    })
  })
}( window.jQuery )
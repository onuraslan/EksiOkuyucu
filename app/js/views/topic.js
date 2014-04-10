
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/topic',
  'text!templates/topic.html',
  'text!templates/topic_nav.html',
  'helpers/popover',
  'bootstrap'
], function ($, _, Backbone, TopicCollection,
             TopicTemplate, TopicNavTemplate, PopoverHelper) {

  var SidebarView = Backbone.View.extend ({
    el: '#main',

    initialize: function () {
      this.topicCollection = new TopicCollection ();
      this.isLoading = false;
      
      // unbind previous events
      // FIXME: need better solution for this
      $(this.el).unbind ('scroll');
      $(this.el).unbind ('click');
    },

    render: function (order, external_url) {
      this.loadResults (order, external_url);
    },

    loadResults: function (order, external_url) {

      var that = this;


      this.isLoading = true;


      // external_url used for new pages
      if (external_url) {
        this.topicCollection.external_url = external_url;
      }

      // FIXME: need to check valid orders
      if (order) {
        this.topicCollection.order = order;
      }
      
      this.topicCollection.fetch ({

        success: function (entries) {

          if (external_url) {

            // clear page
            $(that.el).html ('');
            $(that.el).scrollTop ();

            $('#right-navbar').html (_.template (TopicNavTemplate, {
                                             title: that.topicCollection.title,
                                             external_url: external_url
                                           }));

            // bind refresh button
            $('#refresh-topic').click (function () { that.refresh ();
                                                     return false; });
          }

          $(that.el).append (_.template (TopicTemplate,
                                         {entries: entries.toJSON ()}));

          that.isLoading = false;

          that.checkScroll ();

        },

      });

    },

    events: {
      'scroll': 'checkScroll',
      'click div.entry p.content a': 'popover',
      'click div.entry': 'click'
    },


    checkScroll: function () {

      if (!this.isLoading &&
          !this.topicCollection.lastPage () &&
          this.el.scrollTop + this.el.clientHeight + 200 >
          this.el.scrollHeight) {
        this.topicCollection.nextPage ();
        this.loadResults (); 
      }

    },


    refresh: function () {
      var order = this.topicCollection.order;
      var external_url = this.topicCollection.external_url;
      this.topicCollection.reset ();
      this.topicCollection.firstPage ();
      this.loadResults (order, external_url);
      return false;
    },


    popover: function (ev) {
      return PopoverHelper.popover (ev);
    },


    click: function (ev) {
      var entry = $(ev.currentTarget).attr ('id').replace (/^entry-/, '');
      $('#entry-dropdown-' + entry).css ('left', ev.offsetX - 50).css ('top', ev.offsetY);
      $('#entry-drop-' + entry).dropdown ('toggle');
      return false;
    }

  });

  return SidebarView;

});

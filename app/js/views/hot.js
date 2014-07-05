
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/sidebar',
  'collections/topic',
  'text!templates/topic.html',
  'text!templates/topic_right_nav.html',
  'helpers/nav',
  'views/entry'
], function ($, _, Backbone, SidebarCollection,
             TopicCollection, TopicTemplate, TopicRightNavTemplate,
             NavHelper, EntryView) {

  var HotView = Backbone.View.extend ({
    el: '#main',

    // index of current item
    current_item: 0,
    current_topics: false,

    initialize: function () {
      this.sidebarCollection = new SidebarCollection ();
      this.topicCollection = new TopicCollection ();
      this.isLoading = false;
      
      NavHelper.initialize ('Gündem');
      NavHelper.bindRefresh (this);
    },


    render: function (channel) {

      var that = this;

      if (this.isLoading)
        return;

      this.isLoading = true;

      if (!this.current_topics) {

        if (typeof (channel) != 'undefined') {
          this.sidebarCollection.channel = channel;
          if (channel == 'bugun')
            NavHelper.setTitle ('Bugün ki başlıklar',
                                _.template (TopicRightNavTemplate));
          else if (channel != 'gundem')
            NavHelper.setTitle ('#' + channel,
                                _.template (TopicRightNavTemplate));
        }

        this.sidebarCollection.fetch ({

          success: function (hot_topics) {

            that.isLoading = false;
            that.render ();

          }

        });

        this.current_topics = true;
        return;
      
      }

      this.topicCollection.reset ();
      this.topicCollection.external_url =
          this.sidebarCollection.at (this.current_item).get ('url');

      this.topicCollection.fetch ({

        success: function (entries) {

          that.isLoading = false;

          $(that.el).append (_.template (TopicTemplate,
               {
                 entry_title: that.topicCollection.title,
                 external_url: that.topicCollection.external_url,
                 entries: [ entries
                                .at (0)
                                .toJSON ()
                          ]
               }));

          that.current_item++;

          that.checkScroll ();

        }

      });

      if (!this.entryview) { new EntryView (); this.entryview = true; }

    },


    events: {
      'scroll': 'checkScroll'
    },


    checkScroll: function () {
      if (!this.isLoading &&
          this.current_item < this.sidebarCollection.length &&
          this.el.scrollTop + this.el.clientHeight + 200 >
          this.el.scrollHeight) {
        this.render ();
      }
    },


    refresh: function () {
      $(this.el).html ('');
      this.sidebarCollection.reset ();
      this.topicCollection.reset ();
      this.current_topics = false;
      this.current_item = 0;
      this.render ();
    },

  });


  return HotView;

});


define([
  'jquery',
  'underscore',
  'backbone',
  'collections/topiclist',
  'collections/topic',
  'text!templates/topic.html',
  'helpers/popover',
  'helpers/nav',
  'views/entry'
], function ($, _, Backbone, TopicListCollection,
             TopicCollection, TopicTemplate, PopoverHelper, NavHelper,
             EntryView) {

  var TopicListView = Backbone.View.extend ({
    el: '#main',

    // index of current item
    current_item: 0,
    current_topics: false,

    initialize: function () {
      this.topicListCollection = new TopicListCollection ();
      this.topicCollection = new TopicCollection ();
      this.isLoading = false;
      
      // unbind previous events
      // FIXME: need better solution for this
      $(this.el).unbind ('scroll');
      $(this.el).unbind ('click');

      // clear page content
      $(this.el).html ('');

      // reset popovers
      PopoverHelper.reset ();
    },

    render: function (external_url) {

      var that = this;

      if (this.isLoading)
        return;

      this.isLoading = true;

      if (!this.current_topics) {

        this.topicListCollection.external_url = external_url;

        this.topicListCollection.fetch ({

          success: function (entries) {

            that.isLoading = false;
            that.render ();

          }

        });

        this.current_topics = true;
        return;

      }


      this.topicCollection.reset ();

      if (!this.topicListCollection.at (this.current_item)) {
        console.log ("ZZZZZZZ");
        return;
      }

      this.topicCollection.external_url =
          this.topicListCollection.at (this.current_item).get ('url');

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

          new EntryView ();

          that.current_item++;

          that.checkScroll ();

        }

      });

    },


    events: {
      'scroll': 'checkScroll'
    },


    checkScroll: function () {
      if (!this.isLoading &&
          this.current_item < this.topicListCollection.length &&
          this.el.scrollTop + this.el.clientHeight + 200 >
          this.el.scrollHeight) {
        this.render ();
      }
    },


    refresh: function () {
      $(this.el).html ('');
      this.topicListCollection.reset ();
      this.topicCollection.reset ();
      this.current_topics = false;
      this.current_item = 0;
      this.render ();
      return false;
    },


  });

  return TopicListView;

});

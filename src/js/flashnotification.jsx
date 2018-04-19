var React = require('react'),
    store = require('./flashnotificationstore'),
    Notification = require('react-notification-system'),
    constants = require('./appconstants');

var exports = React.createClass({
    displayName: 'FlashNotification',
    componentDidMount: function(){
        store.addChangeListener(this._onChange);
        this.notifications = this.refs.notifications;
    },
    _onChange: function(){
        var message = store.getLatest();
        if(message){
            this.notifications.addNotification({
                message: message.message,
                level: message.level
            });
        }
    },
    getInitialState: function(){
        return {showing: false};
    },
    render: function(){
        return <Notification ref="notifications" />;
    }
});

module.exports = exports;

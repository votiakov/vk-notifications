// Generated by CoffeeScript 1.6.3
(function() {
  var addGroupItemToStroage, drawGroupItem, groupItems, removeGroupItemFromStorage;

  groupItems = {};

  addGroupItemToStroage = function(item, fn) {
    var callback;
    if (item) {
      if (fn && fn.success && typeof fn.success === "function") {
        callback = fn.success;
      } else {
        callback = function() {};
      }
      item.gid = "-" + item.gid;
      groupItems[item.gid] = item;
      return chrome.storage.local.set({
        'group_items': groupItems
      }, callback);
    } else {
      if (fn && fn.error && typeof fn.error === "function") {
        return fn.error('item is undefined');
      }
    }
  };

  removeGroupItemFromStorage = function(gid, fn) {
    var callback;
    if (gid) {
      if (fn && fn.success && typeof fn.success === "function") {
        callback = fn.success;
      } else {
        callback = function() {};
      }
      delete groupItems[gid];
      return chrome.storage.local.set({
        'group_items': groupItems
      }, callback);
    } else {
      if (fn && fn.error && typeof fn.error === "function") {
        return fn.error('item is undefined');
      }
    }
  };

  drawGroupItem = function($owner, content) {
    return $owner.append($('<img />', {
      src: content.photo
    })).append($('<a />', {
      "class": 'header',
      href: "http://vk.com/" + content.screen_name,
      text: content.name
    })).append($('<button />', {
      "class": 'btn',
      name: 'removeGroupItem',
      text: 'Отписаться',
      'data-group': content.gid
    }));
  };

  $(document).on('click', 'button[name=removeGroupItem]', function(e) {
    var $self;
    $self = $(this);
    removeGroupItemFromStorage($(this).data('group'), {
      success: function() {
        return $self.parent().remove();
      }
    });
    return e.preventDefault();
  });

  $(document).on('keypress', 'input[name=pageUrl]', function(e) {
    if (e.which === 13) {
      return $(this).parent().find('button[name=saveGroupItem]').click();
    }
  });

  $(document).on('click', 'button[name=saveGroupItem]', function(e) {
    var $loader, $pageUrl, $parent, $self, $status, shortName, url;
    $self = $(this);
    $parent = $self.parent();
    $loader = $parent.find('.loader');
    $loader.addClass('visible');
    $status = $parent.find('.status');
    $status.removeClass('visible');
    $pageUrl = $parent.find('[name=pageUrl]');
    url = $pageUrl.val();
    shortName = url.match(/vk.com\/(\w+)/);
    if (!shortName) {
      $status.text('Неверный формат ссылки').addClass('visible');
      $loader.removeClass('visible');
      return;
    }
    API.call('groups.getById', {
      gid: shortName[1]
    }, function(data) {
      if (!data.error) {
        return addGroupItemToStroage(data.response[0], {
          success: function() {
            $pageUrl.remove();
            $self.remove();
            return drawGroupItem($parent, data.response[0]);
          }
        });
      } else {
        $status.text('Группа не найдена').addClass('visible');
        $loader.removeClass('visible');
      }
    });
    $loader.removeClass('visible');
    return e.preventDefault();
  });

  $(function() {
    $('#clean-items').click(function(e) {
      chrome.storage.local.remove('group_items', function() {
        return $('.item').remove();
      });
      return e.preventDefault();
    });
    $('#add-item').click(function(e) {
      var $input;
      $input = $('<input />', {
        type: 'text',
        name: 'pageUrl',
        placeholder: 'Ссылка на группу'
      });
      $('<div />', {
        "class": 'item'
      }).append($input).append($('<button />', {
        "class": 'btn',
        name: 'saveGroupItem',
        text: 'Подписаться'
      })).append($('<div />', {
        "class": 'loader'
      })).appendTo($('.option-items'));
      $input.focus();
      return e.preventDefault();
    });
    $('#auth').click(function(e) {
      chrome.runtime.sendMessage({
        action: "vk_notification_auth"
      }, function(response) {
        if (response.content === 'OK') {
          $('.auth-actions').hide();
          return $('.option-items, #add-item').show();
        }
      });
      return e.preventDefault();
    });
    chrome.storage.local.get({
      'vkaccess_token': {}
    }, function(items) {
      if (items.vkaccess_token.length === void 0) {
        $('.auth-actions').show();
        $('.option-items, #add-item').hide();
      }
    });
    return chrome.storage.local.get({
      'group_items': {}
    }, function(items) {
      var $parent, item, key, _results;
      groupItems = items.group_items;
      _results = [];
      for (key in groupItems) {
        item = groupItems[key];
        $parent = $('<div />', {
          "class": 'item'
        });
        $('.option-items').append($parent);
        _results.push(drawGroupItem($parent, item));
      }
      return _results;
    });
  });

}).call(this);

import angular from 'angular';
import { noop } from 'lodash';
import { uiModules } from 'ui/modules';
import template from './alertBulkEditModal.html';
import { ModalOverlay } from './modal_overlay';

const module = uiModules.get('kibana');

export const ConfirmationButtonTypes = {
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel'
};

/**
 * @typedef {Object} ConfirmModalOptions
 * @property {String} confirmButtonText
 * @property {String=} cancelButtonText
 * @property {function} onConfirm
 * @property {function=} onCancel
 * @property {String=} title - If given, shows a title on the confirm modal. A title must be given if
 * showClose is true, for aesthetic reasons.
 * @property {Boolean=} showClose - If true, shows an [x] icon close button which by default is a noop
 * @property {function=} onClose - Custom close button to call if showClose is true. If not supplied
 * but showClose is true, the function defaults to onCancel.
 */

module.factory('alertBulkEditModal', function ($rootScope, $compile, dashboardSelectModal) {
  let modalPopover;
  const confirmQueue = [];

  /**
   * @param {String} message - the message to show in the body of the confirmation dialog.
   * @param {ConfirmModalOptions} - Options to further customize the dialog.
   */
  return function alertBulkEditModal(customOptions) {
    const defaultOptions = {
      onCancel: noop,
      cancelButtonText: 'Cancel',
      showClose: false,
      defaultFocusedButton: ConfirmationButtonTypes.CANCEL,
      deleteButtonText: 'Delete',
      activateButtonText: 'Activate',
      deactivateButtonText: 'Deactivate',
      updateButtonText: '一括更新',
      deleteMessage: 'Delete selected alerts',
      activateMessage: 'Activate selected alerts',
      deactivateMessage: 'Deactivate selected alerts',
      updateMessage: 'アラートの設定を一括更新'
    };

    if (customOptions.showClose === true && !customOptions.title) {
      throw new Error('A title must be supplied when a close icon is shown');
    }

    if (!customOptions.onDelete || !customOptions.onActivate || !customOptions.onDeactivate || !customOptions.onBulkUpdate) {
      throw new Error('Please specify onDelete, onActivate onDeactivate, and onBulkUpdate action');
    }

    const options = Object.assign(defaultOptions, customOptions);

    // Special handling for onClose - if no specific callback was supplied, default to the
    // onCancel callback.
    options.onClose = customOptions.onClose || options.onCancel;

    const confirmScope = $rootScope.$new();

    confirmScope.cancelButtonText = options.cancelButtonText;
    confirmScope.deleteButtonText = options.deleteButtonText;
    confirmScope.activateButtonText = options.activateButtonText;
    confirmScope.deactivateButtonText = options.deactivateButtonText;
    confirmScope.updateButtonText = options.updateButtonText;
    confirmScope.deleteMessage = options.deleteMessage;
    confirmScope.activateMessage = options.activateMessage;
    confirmScope.deactivateMessage = options.deactivateMessage;
    confirmScope.updateMessage = options.updateMessage;
    confirmScope.title = options.title;
    confirmScope.input = {
      mailAddressTo: [
        {value: ''}
      ],
      mailAddressCc: [],
      mailAddressBcc: [],
      linkDashboards: [],
      editMail: false,
      editDashboard: false
    };
    confirmScope.dashboards = [];
    confirmScope.showClose = options.showClose;
    confirmScope.onDelete = () => {
      destroy();
      options.onDelete();
    };
    confirmScope.onActivate = () => {
      destroy();
      options.onActivate();
    };
    confirmScope.onDeactivate = () => {
      destroy();
      options.onDeactivate();
    };
    confirmScope.onBulkUpdate = () => {
      destroy();
      options.onBulkUpdate(confirmScope.input);
    };
    confirmScope.onCancel = () => {
      destroy();
      options.onCancel();
    };
    confirmScope.onClose = () => {
      destroy();
      options.onClose();
    };
    confirmScope.addTo = function() {
      confirmScope.input.mailAddressTo.push({value: ''});
    };
    confirmScope.deleteTo = function(index) {
      confirmScope.input.mailAddressTo.splice(index, 1);
    };
    confirmScope.addCc = function() {
      confirmScope.input.mailAddressCc.push({value: ''});
    };
    confirmScope.deleteCc = function(index) {
      confirmScope.input.mailAddressCc.splice(index, 1);
    };
    confirmScope.addBcc = function() {
      confirmScope.input.mailAddressBcc.push({value: ''});
    };
    confirmScope.deleteBcc = function(index) {
      confirmScope.input.mailAddressBcc.splice(index, 1);
    };
    confirmScope.toggleEditMail = function(index) {
      confirmScope.input.editMail = !confirmScope.input.editMail;
    };
    confirmScope.toggleEditDashboard = function(index) {
      confirmScope.input.editDashboard = !confirmScope.input.editDashboard;
    };
    confirmScope.removeDashboard = function(index) {
      confirmScope.dashboards.splice(index, 1);
      confirmScope.input.linkDashboards = confirmScope.dashboards.map(item => ({
        id : item.id,
        title : item.title
      }));
    };
    confirmScope.selectDashboard = function () {
      function select(dashboard) {
        if (!~confirmScope.input.linkDashboards.map(item => item.id).indexOf(dashboard.id)) {
          confirmScope.dashboards.push(dashboard);
          confirmScope.input.linkDashboards = confirmScope.dashboards.map(item => ({
            id : item.id,
            title : item.title
          }));
        }
      }
      const confirmModalOptions = {
        select: select,
        title: "ダッシュボード選択",
        showClose: true
      };
      dashboardSelectModal(
        confirmModalOptions
      );
    };

    function showModal(confirmScope) {
      const modalInstance = $compile(template)(confirmScope);
      modalPopover = new ModalOverlay(modalInstance);
      angular.element(document.body).on('keydown', (event) => {
        if (event.keyCode === 27) {
          confirmScope.onCancel();
        }
      });

      switch (options.defaultFocusedButton) {
        case ConfirmationButtonTypes.CONFIRM:
          modalInstance.find('[data-test-subj=alertBulkEditModalConfirmButton]').focus();
          break;
        case ConfirmationButtonTypes.CANCEL:
          modalInstance.find('[data-test-subj=alertBulkEditModalCancelButton]').focus();
          break;
        default:
      }
    }

    if (modalPopover) {
      confirmQueue.unshift(confirmScope);
    } else {
      showModal(confirmScope);
    }

    function destroy() {
      modalPopover.destroy();
      modalPopover = undefined;
      angular.element(document.body).off('keydown');
      confirmScope.$destroy();

      if (confirmQueue.length > 0) {
        showModal(confirmQueue.pop());
      }
    }
  };
});
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PaginationWrapper from '../../PaginationWrapper';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminExternalAccountsContainer from '../../../services/AdminExternalAccountsContainer';
import ExternalAccountTable from './ExternalAccountTable';
import { toastSuccess, toastError } from '../../../util/apiNotification';


class ManageExternalAccount extends React.Component {

  constructor(props) {
    super(props);
    this.xss = window.xss;
    this.handlePage = this.handlePage.bind(this);
    this.removeExtenalAccount = this.removeExtenalAccount.bind(this);
  }

  componentWillMount() {
    this.handlePage(1);
  }

  async handlePage(selectedPage) {
    try {
      await this.props.adminExternalAccountsContainer.retrieveExternalAccountsByPagingNum(selectedPage);
    }
    catch (err) {
      toastError(err);
    }
  }

  // remove external-account
  async removeExtenalAccount(externalAccountId) {
    try {
      await this.props.adminExternalAccountsContainer.removeExternal(externalAccountId);
      toastSuccess(`Removed "${this.xss.process(externalAccountId)}"`);
    }
    catch (err) {
      toastError(new Error(`Unable to remove "${this.xss.process(externalAccountId)}"`));
    }
  }

  render() {
    const { t, adminExternalAccountsContainer } = this.props;

    const pager = (
      <div className="pull-right">
        <PaginationWrapper
          activePage={adminExternalAccountsContainer.state.activePage}
          changePage={this.handlePage}
          totalItemsCount={adminExternalAccountsContainer.state.totalAccounts}
          pagingLimit={adminExternalAccountsContainer.state.pagingLimit}
        />
      </div>
    );
    return (
      <Fragment>
        <p>
          <a className="btn btn-default" href="/admin/users">
            <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
            { t('user_management.back_to_user_management') }
          </a>
        </p>

        <h2>{ t('user_management.external_account_list') }</h2>

        { pager }
        <ExternalAccountTable />
        { pager }

      </Fragment>
    );
  }

}

ManageExternalAccount.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminExternalAccountsContainer: PropTypes.instanceOf(AdminExternalAccountsContainer).isRequired,
};

const ManageExternalAccountWrapper = (props) => {
  return createSubscribedElement(ManageExternalAccount, props, [AppContainer, AdminExternalAccountsContainer]);
};


export default withTranslation()(ManageExternalAccountWrapper);

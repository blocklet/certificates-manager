import React, { useEffect, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import styled from 'styled-components';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';

import Button from '@arcblock/ux/lib/Button';
import Toast from '@arcblock/ux/lib/Toast';

import ConfirmDialog from './confirm';

import api from '../libs/api';

export default function DomainList({ ...props }) {
  const state = useAsync(() => api.get('/domains').then((resp) => resp.data));
  const [confirmSetting, setConfirmSetting] = useState(null);
  const [removeError, setRemoveError] = useState('');
  const [removeSuccess, setRemoveSuccess] = useState('');
  const [domainsDnsStatusMap, setDomainsDnsStatusMap] = useState({});

  useEffect(async () => {
    if (state.value) {
      const domainsStatus = await api.post('/dns-status', { domains: state.value.map((x) => x.domain) });
      try {
        const domainsMap = (domainsStatus.data || []).reduce((acc, cur) => {
          acc[cur.domain] = cur;
          return acc;
        }, {});

        console.log(domainsStatus);
        setDomainsDnsStatusMap(domainsMap);
      } catch (error) {
        console.error('load domain status error:', error);
      }
    }
  }, [state.value]);

  if (state.loading) {
    return <CircularProgress />;
  }

  const onConfirm = async (domain) => {
    try {
      await api.delete(`/domains/${domain}`);
      setRemoveSuccess('Remove domain successfully!');
    } catch (error) {
      setRemoveError('Remove domain error:', error.message);
    }

    setConfirmSetting(null);
  };

  const onCancel = () => {
    setConfirmSetting(null);
  };

  const handleRemoveDomain = (domain) => {
    if (!domain) {
      console.error('invalid domain');
      return;
    }

    setConfirmSetting({
      title: 'Remove Domain',
      description: (
        <p>
          Confirm remove the doamin <b>{domain}</b>
        </p>
      ),
      confirm: 'Confirm',
      cancel: 'Cancel',
      onConfirm: () => onConfirm(domain),
      onCancel,
    });
  };

  return (
    <Div {...props}>
      <div className="title">Domain List</div>
      <TableContainer className="table">
        <Table aria-label="domain list">
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Challenge</TableCell>
              <TableCell>DNS Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Operation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(state.value || []).map((row) => (
              <TableRow key={row.domain}>
                <TableCell>{row.domain}</TableCell>
                <TableCell>{row.challenge}</TableCell>
                {domainsDnsStatusMap[row.domain] && (
                  <TableCell>{domainsDnsStatusMap[row.domain].resolved ? 'Normal' : 'Not Resolved'}</TableCell>
                )}
                {!domainsDnsStatusMap[row.domain] && <TableCell />}
                <TableCell>{row.createdAt}</TableCell>
                <TableCell>
                  <Button onClick={() => handleRemoveDomain(row.domain)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {confirmSetting && (
        <ConfirmDialog
          title={confirmSetting.title}
          description={confirmSetting.description}
          confirm={confirmSetting.confirm}
          cancel={confirmSetting.cancel}
          onConfirm={confirmSetting.onConfirm}
          onCancel={confirmSetting.onCancel}
        />
      )}
      {!!removeError && <Toast variant="error" message={removeError} onClose={() => setRemoveError('')} />}
      {!!removeSuccess && (
        <Toast variant="success" duration={3000} message={removeSuccess} onClose={() => setRemoveSuccess('')} />
      )}
    </Div>
  );
}

const Div = styled.div`
  width: 60%;
  border: 1px solid #000;
  padding: ${(props) => props.theme.spacing(5)}px;

  .title {
    text-align: center;
    color: #000;
    font-size: 1.2rem;
  }

  .table {
    margin-top: ${(props) => props.theme.spacing(3)}px;
  }
`;

DomainList.propTypes = {};

DomainList.defaultProps = {};

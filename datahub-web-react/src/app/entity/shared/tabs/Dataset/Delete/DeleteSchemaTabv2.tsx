// import { Empty } from 'antd';
import React from 'react';
import { Button, Popconfirm, Result } from 'antd';
import axios from 'axios';
// import { gql, useQuery } from '@apollo/client';
import { GetDatasetQuery } from '../../../../../../graphql/dataset.generated';
// import { useGetAuthenticatedUser } from '../../../../../useGetAuthenticatedUser';
import { useBaseEntity } from '../../../EntityContext';
import { FindMyUrn, FindWhoAmI, GetMyToken } from '../../../../dataset/whoAmI';
import { WhereAmI } from '../../../../../home/whereAmI';
import { printErrorMsg, printSuccessMsg } from '../ApiCallUtils';
// import adhocConfig from '../../../../../../conf/Adhoc';

// function CheckStatus(queryresult, currDataset) {
//     const { data } = useQuery(queryresult, { skip: currDataset === undefined });
//     const currStatus = data === undefined ? false : data;
//     return currStatus;
// }
function CheckStatus(entity) {
    const rawStatus = entity?.dataset?.status?.removed;
    const currStatus = rawStatus === undefined ? false : rawStatus;
    return currStatus;
}

export const DeleteSchemaTabv2 = () => {
    const urlBase = WhereAmI();
    const publishUrl = `${urlBase}custom/update_dataset_status`;
    // console.log(`Submit url: ${publishUrl}`);
    const [visible, setVisible] = React.useState(false);
    const [confirmLoading, setConfirmLoading] = React.useState(false);
    const baseEntity = useBaseEntity<GetDatasetQuery>();
    const currDataset = baseEntity && baseEntity?.dataset?.urn;
    const currStatusBase = baseEntity && baseEntity?.dataset?.status?.removed;
    const currStatus = currStatusBase === undefined ? false : currStatusBase;
    console.log(`the current status of the dataset is removed:, ${currStatusBase}, ${currStatus}`);
    const statusFinal = currStatus ? 'error' : 'success';
    const statusMsg = currStatus ? 'Dataset is not searchable' : 'Dataset is searchable via search and listing';
    const buttonMsg = currStatus ? 'Activate Dataset' : 'Deactivate Dataset';
    const popupMsg = `Confirm ${buttonMsg}`;

    const warning =
        "You wouldn't be able to find this page after navigating away. Please copy page url before leaving page in case you need to undo deactivation.";
    const subMsg = currStatus ? warning : '';

    // const currUser = useGetAuthenticatedUser()?.corpUser?.username || '-';
    const currUser = FindWhoAmI();
    const currUserUrn = FindMyUrn();
    const userToken = GetMyToken(currUserUrn);
    // console.log(`user is ${currUser} and token is ${userToken}, received at ${Date().toLocaleString()}`);

    const deleteDataset = async () => {
        axios
            .post(publishUrl, {
                dataset_name: currDataset,
                requestor: currUser,
                desired_state: !CheckStatus(baseEntity),
                user_token: userToken,
            })
            .then((response) => {
                printSuccessMsg(response.status);
                window.location.reload();
            })
            .catch((exception) => {
                printErrorMsg(exception.toString());
            });
    };

    const showPopconfirm = () => {
        setVisible(true);
    };
    const handleOk = () => {
        setConfirmLoading(true);
        deleteDataset();
        setTimeout(() => {
            setVisible(false);
            setConfirmLoading(false);
        }, 3000);
    };

    const handleCancel = () => {
        // console.log('Clicked cancel button');
        setVisible(false);
    };
    return (
        <>
            <Result
                status={statusFinal}
                title={statusMsg}
                subTitle={subMsg}
                extra={[
                    <Popconfirm
                        title={popupMsg}
                        visible={visible}
                        onConfirm={handleOk}
                        okButtonProps={{ loading: confirmLoading }}
                        onCancel={handleCancel}
                    >
                        <Button type="primary" key="console" onClick={showPopconfirm}>
                            {buttonMsg}
                        </Button>
                        ,
                    </Popconfirm>,
                ]}
            />
            ,
        </>
    );
};

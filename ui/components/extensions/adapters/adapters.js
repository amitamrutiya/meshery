import { isNil, isUndefined } from 'lodash';
import { useEffect, useState } from 'react';
import { CardContainer, FrontSideDescription, ImageWrapper } from '../../../css/icons.styles';
import { ADAPTER_STATUS, adaptersList } from './constants';
import changeAdapterState from '../../graphql/mutations/AdapterStatusMutation';
import { LARGE_6_MED_12_GRID_STYLE } from '../../../css/grid.style';
import { promisifiedDataFetch } from '../../../lib/data-fetch';
import { useNotification } from '../../../utils/hooks/useNotification';
import { EVENT_TYPES } from '../../../lib/event-types';
import { Grid2, Switch, Typography, useTheme } from '@layer5/sistent';
import { updateProgress } from '@/store/slices/mesheryUi';

const Adapters = () => {
  // States.
  const [availableAdapters, setAvailableAdapters] = useState(adaptersList);

  // Hooks.
  const { notify } = useNotification();

  // useEffects.
  useEffect(() => {
    handleAdapterSync();
  }, []);

  const theme = useTheme();

  // Handlers.
  const handleAdapterSync = async (showLoader = true) => {
    showLoader && updateProgress({ showProgress: true });

    promisifiedDataFetch('/api/system/sync', {
      method: 'GET',
      credentials: 'include',
    })
      .then((result) => {
        showLoader && updateProgress({ showProgress: false });

        if (!isUndefined(result)) {
          // Deep copying to avoid mutability.
          // Ref: https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
          let currentAdaptersList = structuredClone(adaptersList);

          result.meshAdapters.forEach((element) => {
            const adapterId = element.name;
            if (adapterId && currentAdaptersList[adapterId]) {
              currentAdaptersList[adapterId].enabled = true;
              currentAdaptersList[adapterId].url = element.adapter_location;
            }
          });
          setAvailableAdapters(currentAdaptersList);
        }
      })
      .catch(() => handleError('Unable to fetch list of adapters.'));
  };

  const handleAdapterDeployment = (payload, msg, selectedAdapter, adapterId) => {
    updateProgress({ showProgress: true });

    changeAdapterState((response, errors) => {
      updateProgress({ showProgress: false });

      if (!isNil(errors)) {
        // Toggle the switch to its previous state if the request fails.
        setAvailableAdapters({
          ...availableAdapters,
          [adapterId]: { ...selectedAdapter, enabled: !selectedAdapter.enabled },
        });
        handleError(msg);
      } else {
        const actionText = payload.status.toLowerCase();
        notify({
          message: `${selectedAdapter.name} adapter ${actionText}`,
          event_type: EVENT_TYPES.SUCCESS,
        });
      }
    }, payload);
  };

  const handleError = (msg) => (error) => {
    updateProgress({ showProgress: false });
    notify({ message: msg, event_type: EVENT_TYPES.ERROR, details: error.toString() });
  };

  const handleToggle = (selectedAdapter, adapterId) => {
    setAvailableAdapters({
      ...availableAdapters,
      [adapterId]: { ...selectedAdapter, enabled: !selectedAdapter.enabled },
    });
    let payload = {},
      msg = '';
    if (!selectedAdapter.enabled) {
      payload = {
        status: ADAPTER_STATUS.ENABLED,
        adapter: selectedAdapter.label,
        targetPort: selectedAdapter.defaultPort,
      };
      msg = 'Unable to deploy adapter';
    } else {
      payload = {
        status: ADAPTER_STATUS.DISABLED,
        adapter: selectedAdapter.label,
        targetPort: selectedAdapter.defaultPort,
      };
      msg = 'Unable to undeploy adapter';
    }
    handleAdapterDeployment(payload, msg, selectedAdapter, adapterId);
  };

  // Render.
  return (
    <>
      {Object.entries(availableAdapters).map(([adapterId, adapter]) => (
        <Grid2 size={LARGE_6_MED_12_GRID_STYLE} key={adapterId}>
          <CardContainer>
            <Typography variant="h5" component="div">
              Meshery Adapter for {adapter.name}
            </Typography>

            <FrontSideDescription variant="body">
              <ImageWrapper src={adapter.imageSrc} />
              <div
                style={{
                  display: 'inline',
                  position: 'relative',
                }}
              >
                {adapter.description}
              </div>
            </FrontSideDescription>

            <Grid2
              container
              spacing={2}
              direction="row"
              size="grow"
              justifyContent="space-between"
              alignItems="baseline"
              style={{
                position: 'absolute',
                paddingRight: '3rem',
                paddingLeft: '.5rem',
                bottom: '1.5rem',
              }}
            >
              <Typography variant="subtitle2" style={{ fontStyle: 'italic' }}>
                <a
                  href="https://docs.meshery.io/concepts/architecture/adapters"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: 'none',
                    color: theme.palette.text.brand,
                  }}
                  data-testid={`adapter-docs-${String(adapter.name).toLowerCase()}`}
                >
                  Open Adapter docs
                </a>
              </Typography>

              <div style={{ textAlign: 'right' }}>
                <Switch
                  checked={adapter.enabled}
                  onChange={() => handleToggle(adapter, adapterId)}
                  name="OperatorSwitch"
                  color="primary"
                />
              </div>
            </Grid2>
          </CardContainer>
        </Grid2>
      ))}
    </>
  );
};

export default Adapters;

import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TIME_SYNC_STATE = gql`
  query GetTimeSyncState {
    timeSyncState @client {
      connectionStatus
      serverTime
      offset
      roundTripDelay
    }
  }
`;

const UPDATE_TIME_SYNC_STATE = gql`
  mutation UpdateTimeSyncState($state: TimeSyncStateInput!) {
    updateTimeSyncState(state: $state) @client
  }
`;

export function useTimeSyncState() {
  const { data } = useQuery(GET_TIME_SYNC_STATE);
  const [updateTimeSyncState] = useMutation(UPDATE_TIME_SYNC_STATE);

  return {
    timeSyncState: data?.timeSyncState,
    updateTimeSyncState: (state: Partial<TimeSyncState>) =>
      updateTimeSyncState({ variables: { state } }),
  };
}

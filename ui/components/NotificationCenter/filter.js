import { useGetEventFiltersQuery } from '../../rtk-query/notificationCenter';
import TypingFilter from '../TypingFilter';
import { SEVERITY, STATUS } from './constants';

const useFilterSchema = () => {
  const { data } = useGetEventFiltersQuery();

  return {
    SEVERITY: {
      value: 'severity',
      description: 'Filter by severity',
      values: Object.values(SEVERITY),
    },

    STATUS: {
      value: 'status',
      description: 'Filter by status',
      values: Object.values(STATUS),
      multiple: false,
    },

    ACTION: {
      value: 'action',
      values: data?.action || [],
      description: 'Filter by type',
    },

    AUTHOR: {
      value: 'author',
      description: 'Filter by any user or system',
    },

    CATEGORY: {
      value: 'category',
      description: 'Filter by category',
      values: data?.category || [],
    },
  };
};

const Filter = ({ handleFilter }) => {
  const filterSchema = useFilterSchema();
  return (
    <TypingFilter
      handleFilter={handleFilter}
      filterSchema={filterSchema}
      defaultFilters={[
        {
          type: 'STATUS',
          value: 'unread',
          label: 'status: unread',
        },
      ]}
      placeholder="Filter Notifications"
    />
  );
};

export default Filter;

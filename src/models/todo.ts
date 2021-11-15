import { ListTodosQuery } from "../API";
import { GraphQLResult } from "@aws-amplify/api";
import { Todo } from "../API";

const mapListTodosQuery = (
  listTodosQuery: GraphQLResult<ListTodosQuery>
): Todo[] => {
  return (
    listTodosQuery.data?.listTodos?.items?.map(
      (todo) =>
        ({
          id: todo?.id,
          name: todo?.name,
          description: todo?.description,
        } as Todo)
    ) || []
  );
};

export { mapListTodosQuery as mapListTodos };

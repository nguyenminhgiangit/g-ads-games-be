import { getCounterModel } from "./counter.model";
import { getSessionModel } from "./session.model";
import { getSubmissionModel } from "./submission.model";
import { getUserModel } from "./user.model";
import { getUserStateModel } from "./user.state.model";

class ModelRegistry {
  get Session() {
    return getSessionModel();
  }

  get User() {
    return getUserModel();
  }

  get GuestCounter() {
    return getCounterModel();
  }

  get UserState() {
    return getUserStateModel();
  }

  get Submission() {
    return getSubmissionModel();
  }
}

export const Models = new ModelRegistry();
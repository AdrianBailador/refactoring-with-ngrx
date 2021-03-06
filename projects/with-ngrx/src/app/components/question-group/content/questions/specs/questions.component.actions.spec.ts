import { FormsModule } from '@angular/forms';
import { createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { CustomModalService } from 'src/app/services/custom-modal/custom-modal.service';
import { State } from 'src/app/state/definition';
import { QuestionsActionTypes } from 'src/app/state/questions/actions';
import { Given } from 'src/app/state/questions/shared/questions.fixtures';
import { AnswersComponent } from '../answers/answers.component';
import { QuestionsComponent } from '../questions.component';

const initialState: State = {
  answers: [],
  questions: [],
  questionGroups: [],
  currentQuestionGroup: { id: 0, name: '' },
  loader: { isActive: false, pendingRequests: 0 }
};

describe('The questions component actions', () => {
  let spectator: Spectator<QuestionsComponent>;
  let mockStore: SpyObject<MockStore>;
  let dispatchSpy: jest.SpyInstance;
  const createComponent = createComponentFactory({
    component: QuestionsComponent,
    declarations: [AnswersComponent],
    imports: [FormsModule],
    providers: [CustomModalService, provideMockStore({ initialState })]
  });

  beforeEach(() => {
    spectator = createComponent();
    mockStore = spectator.inject(MockStore);
    dispatchSpy = jest.spyOn(mockStore, 'dispatch');
  });

  it('should dispatch the create question action', () => {
    const a_new_question = 'A new question';
    const new_question_input = spectator.query('.create-question-input');

    spectator.typeInElement(a_new_question, new_question_input);
    spectator.dispatchKeyboardEvent(new_question_input, 'keyup', 13);

    expect(dispatchSpy).toHaveBeenCalledWith({ type: QuestionsActionTypes.CREATE, payload: { text: a_new_question } });
  });

  it('should dispatch the edit question action', () => {
    const a_question = Given.a_question();
    const a_question_list = [a_question];

    mockStore.setState({ ...initialState, questions: a_question_list });
    spectator.detectChanges();
    const an_edited_question = 'Edited question';
    const an_existing_question_input = spectator.query(`input[id="question-${a_question.id}"]`);
    spectator.typeInElement(an_edited_question, an_existing_question_input);
    spectator.dispatchFakeEvent(an_existing_question_input, 'focusout');

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: QuestionsActionTypes.EDIT,
      payload: { question: { ...a_question, text: an_edited_question } }
    });
  });

  it('should dispatch the delete question action', () => {
    const a_question = Given.a_question();
    const a_question_list = [a_question];

    mockStore.setState({ ...initialState, questions: a_question_list });
    spectator.detectChanges();
    const an_existing_question_delete_button = spectator.query(`button[id="delete-question-${a_question.id}"]`);
    spectator.click(an_existing_question_delete_button);
    const custom_modal_service = spectator.inject<CustomModalService>(CustomModalService);
    custom_modal_service.stateChange.emit({ confirmed: true });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: QuestionsActionTypes.DELETE,
      payload: { questionId: a_question.id }
    });
  });

  it('should dispatch the toggle question action', () => {
    const a_question = Given.a_question();
    const a_question_list = [a_question];

    mockStore.setState({ ...initialState, questions: a_question_list });
    spectator.detectChanges();
    const an_existing_question_toggle_button = spectator.query(`button[id="toggle-question-${a_question.id}"]`);
    spectator.click(an_existing_question_toggle_button);

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: QuestionsActionTypes.TOGGLE,
      payload: { questionId: a_question.id }
    });
  });
});

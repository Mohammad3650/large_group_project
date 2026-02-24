import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ScheduleForm = () => {
  const [formCount, setFormCount] = useState(window.FORMSET_DATA.initialForms.length);
  const [forms, setForms] = useState(window.FORMSET_DATA.initialForms);

  const addNewForm = (e) => {
    e.preventDefault();

    const newFormHtml = window.FORMSET_DATA.emptyForm.replace(/__prefix__/g, formCount);
    setForms([...forms, newFormHtml]);
    setFormCount(formCount + 1);
  };

  return (
    <div className="container mt-5">
      <div className="card border-primary shadow">
        <div className="card-title text-center">
          <h1 className="display-4 mb-2 mt-2 py-4"><b>Create Your Schedule...</b></h1>
        </div>
        <div className="card-body">
          <form method="post">
            <div dangerouslySetInnerHTML={{ __html: window.FORMSET_DATA.managementForm }} />

            <div id="schedule-forms">
              {forms.map((formHtml, index) => (
                <div key={index} className="schedule-form">
                  <div className="row px-5">
                    <div className="col justify-content-center">
                      <div dangerouslySetInnerHTML={{ __html: formHtml }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-grid mb-4">
              <button id="add-more" type="button" onClick={addNewForm} className="btn btn-secondary">
                Add More
              </button>
            </div>

            <div className="d-grid mb-4">
              <button type="submit" className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                </svg>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<ScheduleForm />, document.getElementById('schedule-form-root'));
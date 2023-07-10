$(() => {
  let formatDate = new Intl.DateTimeFormat("en-US").format;
	let changes = [];

	const dataGrid = $("#gridContainer")
		.dxDataGrid({
			dataSource: employees,
			keyExpr: "ID",
			dataRowTemplate: function (container, item) {
				if (item.isEditing) {
					createEditRowTemplate(container, item);
				} else {
					createDataRowTemplate(container, item);
				}
			},
			rowAlternationEnabled: true,
			columnAutoWidth: true,
			showBorders: true,
			columns: [
				{
					dataField: "Prefix",
					caption: "Title",
					width: 70
				},
				"FirstName",
				"LastName",
				"Position",
				{
					dataField: "BirthDate",
					dataType: "date"
				},
				{
					dataField: "HireDate",
					dataType: "date"
				},
				{
					width: 160
				}
			],
			onToolbarPreparing: function (e) {
				e.toolbarOptions.items.unshift({
					location: "after",
					widget: "dxButton",
					options: {
						text: "Add new item",
						onClick: function () {
							e.component.cancelEditData();
							e.component.addRow();
							changes = e.component.option("editing.changes");
						}
					}
				});
			},
			onInitNewRow: function (e) {
				e.data.Prefix = "";
				e.data.FirstName = "";
				e.data.LastName = "";
				e.data.Position = "";
				e.data.BirthDate = new Date("1986/07/08");
				e.data.HireDate = new Date("1986/07/08");
				e.data.Notes = "";
			}
		})
		.dxDataGrid("instance");

	const createEditRowTemplate = (container, item) => {
		let data = item.data;
		let markup = createEditMarkup(data);
		container.append(markup);

		editors.forEach((editor) => {
			createEditor(
				editor.editorID,
				data[editor.dataField],
				editor.dataField,
				data.ID
			);
		});

		$("#notesEditor").dxTextArea({
			value: data.Notes,
			onValueChanged: onValueChanged("Notes", data.ID)
		});

		createButtons(container, item, "Save", "Cancel");
	};

	const createDataRowTemplate = (container, item) => {
		let markup = createDataMarkup(item.data);
		container.append(markup);

		createButtons(container, item, "Edit", "Delete");
	};

	const createEditor = (editorID, value, dataField, dataID) => {
		const isDateField = dataField === "BirthDate" || dataField === "HireDate";
		const options = {
			value: isDateField ? new Date(value) : value,
			onValueChanged: onValueChanged(dataField, dataID)
		};
		return isDateField
			? $(editorID).dxDateBox(options)
			: $(editorID).dxTextBox(options);
	};

	const onValueChanged = (dataField, key) => ({ value }) => {
		if (!changes.length) {
			changes.push({ data: { [dataField]: value }, key: key, type: "update" });
		} else {
			changes[0].data = { ...changes[0].data, [dataField]: value };
		}
	};

	const createButton = (text, item) => {
		let $buttonContainer = $("<div>");
		return $buttonContainer.dxButton({
			text: text,
			onClick: function () {
				const { component } = item;
				switch (text) {
					case "Save":
						component.option("editing.changes", changes);
						component.saveEditData();
						component.refresh();
						break;
					case "Cancel":
						component.cancelEditData();
						component.refresh();
						break;
					case "Edit":
						component.cancelEditData();
						component.editRow(item.rowIndex);
						changes = component.option("editing.changes");
						break;
					case "Delete":
						component.deleteRow(item.rowIndex);
						break;
				}
			}
		});
	};

	const createButtons = (container, item, button1, button2) => {
		const $button1 = createButton(button1, item);
		const $button2 = createButton(button2, item);

		$(container)
			.find("#editColumn-" + item.data.ID)
			.append($button1, $button2);
	};

	const createEditMarkup = (data) => {
		return (
			"<tr class='main-row'>" +
			"<td><div id='prefixEditor'></div></td>" +
			"<td><div id='firstNameEditor'></div></td>" +
			"<td><div id='lastNameEditor'></div></td>" +
			"<td><div id='positionEditor'></td>" +
			"<td><div id='birthDateEditor'></div></td>" +
			"<td><div id='hireDateEditor'></div></td>" +
			"<td rowspan='2' id='editColumn-" +
			data.ID +
			"'></td>" +
			"</tr>" +
			"<tr class='notes-row'>" +
			"<td colspan='6'><div id='notesEditor'></div></td>" +
			"</tr>"
		);
	};

	const createDataMarkup = (data) => {
		return (
			"<tr class='main-row'>" +
			"<td>" +
			data.Prefix +
			"</td>" +
			"<td>" +
			data.FirstName +
			"</td>" +
			"<td>" +
			data.LastName +
			"</td>" +
			"<td>" +
			data.Position +
			"</td>" +
			"<td>" +
			formatDate(new Date(data.BirthDate)) +
			"</td>" +
			"<td>" +
			formatDate(new Date(data.HireDate)) +
			"</td>" +
			"<td rowspan='2' id='editColumn-" +
			data.ID +
			"'></td>" +
			"</tr>" +
			"<tr class='notes-row'>" +
			"<td colspan='6'><div>" +
			data.Notes +
			"</div></td>" +
			"</tr>"
		);
	};
});

import random
from datetime import datetime, timedelta, date
import dash
import dash_core_components as dcc
import dash_html_components as html
import plotly.express as px
import pandas as pd
import plotly.figure_factory as ff


external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

def get_activity_watch_data():
    
    input_df = pd.read_csv("../aw_data_grouped.csv")

    return input_df

df = get_activity_watch_data()

def get_chart_colors(input_df):
    r = lambda: random.randint(0,255)             
    colors = ['#%02X%02X%02X' % (r(),r(),r())]              
    for i in range(1, input_df.Resource.nunique()+1):                                   
        colors.append('#%02X%02X%02X' % (r(),r(),r()))

    return colors


def plot_period_activity(df: pd.DataFrame, start_date: datetime, end_date: datetime, min_time_spent_secs = 100):

    print("request parameters")
    print( start_date )
    print( end_date )
    print( min_time_spent_secs )

    # #activity_watch_summarized = summary_day, total_time_surfing, what_app_did_user_spend_x_percent_of_time_on (one column per percent) , events_usage (tuple: event_classification (encoded), sum_total_time)

    # group data by "weekly, monthly"" -- default granularity is daily"
    # filter by minimum time spent 

    # choose top events based on duration seconds
    aw_events_gantt_data = df[df['duration_seconds'] >= min_time_spent_secs] # 1000 seconds ~ 16min (significant activity) 
    
    aw_events_gantt_data.rename(columns={
        'event_classification': 'Task',
        'summary_day': 'Start',
        'summary_day_end': 'Finish',
        'app': 'Resource'
        }, inplace=True)

        
    # aw_events_gantt_data.pop("duration_seconds") # --- can use this to show a summary afterwards (different vis)

    # aw_events_gantt_data.filter(like="2021-04-23", axis=0)

    aw_events_gantt_data["isMatch"] = aw_events_gantt_data['Start'].apply(
        lambda value: (datetime.strptime(value, "%Y-%m-%d") >= start_date and
                        datetime.strptime(value, "%Y-%m-%d") <= end_date )
    )
    
    aw_events_gantt_data = aw_events_gantt_data[ aw_events_gantt_data["isMatch"] == True ]
    aw_events_gantt_data.pop("isMatch")

    aw_events_gantt_data = aw_events_gantt_data.reset_index()
    aw_events_gantt_data.pop("index")

    # print("replotting chart")
    # print(aw_events_gantt_data.head(10))

    colors = get_chart_colors(aw_events_gantt_data)

    fig = ff.create_gantt(aw_events_gantt_data, colors=colors, index_col='Resource', 
                        show_colorbar=True, group_tasks=True, height=1200, title="Activites in period")

    return fig

app.layout = html.Div(children=[
    html.H1(children='fusion'),

    html.Div(children='''
        understanding self :)
    '''),

    dcc.DatePickerRange(
        id='my-date-picker-range',
        min_date_allowed=datetime.now().date() - timedelta(days=365),
        max_date_allowed=datetime.now().date(),
        initial_visible_month= date.fromisoformat("2021-02-27"),
        start_date= date.fromisoformat("2021-02-27"),
        end_date= date.fromisoformat("2021-03-01")
    ),
    html.Div(id='output-container-date-picker-range'),

    dcc.Graph(
        id='aw-gantt-graph',
        figure=plot_period_activity(df, datetime.fromisoformat("2021-02-27"), datetime.fromisoformat("2021-03-01"))
    )
])

@app.callback(
    dash.dependencies.Output('output-container-date-picker-range', 'children'),
    [dash.dependencies.Input('my-date-picker-range', 'start_date'),
     dash.dependencies.Input('my-date-picker-range', 'end_date')])
def update_output(start_date, end_date):
    string_prefix = 'Here are activities you\'ve indulged in between '
    if start_date is not None:
        start_date_object = date.fromisoformat(start_date)
        start_date_string = start_date_object.strftime('%B %d, %Y')
        string_prefix = string_prefix + 'Start Date: ' + start_date_string + ' | '
    if end_date is not None:
        end_date_object = date.fromisoformat(end_date)
        end_date_string = end_date_object.strftime('%B %d, %Y')
        string_prefix = string_prefix + 'End Date: ' + end_date_string
    if len(string_prefix) == len('You have selected: '):
        return 'Select a date to see it displayed here'
    else:
        return string_prefix

@app.callback(
    dash.dependencies.Output('aw-gantt-graph', 'figure'),
    [dash.dependencies.Input('my-date-picker-range', 'start_date'),
     dash.dependencies.Input('my-date-picker-range', 'end_date')])
def update_output(start_date, end_date):
    if (start_date is not None) and (end_date is not None):
        start_date_string = datetime.fromisoformat(start_date)
        end_date_string = datetime.fromisoformat(end_date)
        
        return plot_period_activity(df, start_date_string, end_date_string)

if __name__ == '__main__':
    app.run_server(debug=True)




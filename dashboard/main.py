import random
from datetime import datetime, timedelta, date
import dash
import dash_core_components as dcc
import dash_html_components as html
from nltk.collections import LazyEnumerate
import plotly.express as px
import pandas as pd
import plotly.figure_factory as ff
import dash_table
import plotly.graph_objects as go

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

def get_activity_watch_data():
    
    input_df = pd.read_csv("../data/aw_data_grouped_2021_08_04.csv")

    return input_df

df = get_activity_watch_data()

def get_chart_colors(input_df):
    r = lambda: random.randint(0,255)             
    colors = ['#%02X%02X%02X' % (r(),r(),r())]              
    for i in range(1, input_df.Resource.nunique()+1):                                   
        colors.append('#%02X%02X%02X' % (r(),r(),r()))

    return colors

def filter_date(df: pd.DataFrame, date_column: str, start_date: datetime, end_date: datetime):
    """
    Takes a start and end date (datetime) and removes from dataframe"""

    df["isMatch"] = df[date_column].apply(
        lambda value: (datetime.strptime(value, "%Y-%m-%d") >= start_date and
                        datetime.strptime(value, "%Y-%m-%d") <= end_date )
    )
    
    df = df[ df["isMatch"] == True ]
    df.pop("isMatch")

    df = df.reset_index()
    df.pop("index")

    return df


def plot_period_activity(df: pd.DataFrame, start_date: datetime, end_date: datetime, min_time_spent_secs = 100):

    # #activity_watch_summarized = summary_day, total_time_surfing, what_app_did_user_spend_x_percent_of_time_on (one column per percent) , events_usage (tuple: event_classification (encoded), sum_total_time)

    # group data by "weekly, monthly"" -- default granularity is daily"

    # choose top events based on duration seconds
    aw_events_gantt_data = df[df['duration_seconds'] >= min_time_spent_secs]
    
    aw_events_gantt_data.rename(columns={
        'event_classification': 'Task',
        'summary_day': 'Start',
        'summary_day_end': 'Finish',
        'app': 'Resource'
        }, inplace=True)

    aw_events_gantt_data = filter_date( aw_events_gantt_data, 'Start', start_date, end_date)

    colors = get_chart_colors(aw_events_gantt_data)

    fig = ff.create_gantt(aw_events_gantt_data, colors=colors, index_col='Resource', 
                        show_colorbar=True, group_tasks=True, height=1200, title="Activites in period")

    return fig

def plot_period_summary(df: pd.DataFrame, start_date: datetime, end_date: datetime, top= 10):
    """
    
    TODO: change this to show "active time wspent on laptop, instead of just total time between date range
    """

    aw_summary = filter_date(df, 'summary_day', start_date, end_date)
    aw_summary = aw_summary.groupby(["event_classification"], as_index=False)
    aw_summary = aw_summary.agg({
                        'duration_seconds': 'sum'
                    })
    aw_summary = aw_summary.sort_values(by=['duration_seconds'], ascending=False).head(20)
    print(aw_summary)

    # divide by 60 to convert to minutes
    aw_summary['duration_minutes'] = aw_summary['duration_seconds'].apply( lambda value: value // 60 )

    aw_summary['duration_hours'] = aw_summary['duration_seconds'].apply( lambda value: round(value / (60*60), 1))

    
    fig = go.Figure(data=[go.Table(
        header=dict(values=["Activity", "Total time spent (hours)", "Total time spent (minutes)"],
                    fill_color='paleturquoise',
                    align='left'),
        cells=dict(values=[aw_summary.event_classification, aw_summary.duration_hours, aw_summary.duration_minutes],
                fill_color='lavender',
                align='left')),
    ])

    # fig = px.bar(aw_summary, x='event_classification', y='duration_minutes', 
    #                     title='Top 20 activites and their duration from {} to {}'.format(start_date.strftime('%B %d, %Y'), end_date.strftime('%B %d, %Y')))

    return fig


app.layout = html.Div(children=[
    html.H1(children='fusion'),

    html.Div(children=[
        html.P('''understanding self :)'''),
        # Chart filters
        html.Div(children= [
            dcc.DatePickerRange(
                id='my-date-picker-range',
                min_date_allowed=datetime.now().date() - timedelta(days=365),
                max_date_allowed=datetime.now().date(),
                initial_visible_month= date.fromisoformat("2021-02-27"),
                start_date= date.fromisoformat("2021-02-27"),
                end_date= date.fromisoformat("2021-03-01")
            ),
            html.P('''Minimum time spent'''),
            dcc.Input(
                id="input_range", type="number", placeholder="Time spent (mins)",
                min=10, max=100, 
            ),
            html.Div(id='output-container-date-picker-range'), 
        ]),
        html.Hr(),
        # Display Graphs
        dcc.Graph(
            id='aw-duration_summary-chart',
            figure=plot_period_summary(df, datetime.fromisoformat("2021-02-27"), datetime.fromisoformat("2021-03-01"))
        ),
        dcc.Graph(
            id='aw-gantt-graph',
            figure=plot_period_activity(df, datetime.fromisoformat("2021-02-27"), datetime.fromisoformat("2021-03-01"))
        )
        
    ])
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
        string_prefix = string_prefix + " " + start_date_string + ' and '
    if end_date is not None:
        end_date_object = date.fromisoformat(end_date)
        end_date_string = end_date_object.strftime('%B %d, %Y')
        string_prefix = string_prefix + ' ' + end_date_string
    if len(string_prefix) == len('Here are activities you\'ve indulged in between '):
        return 'Select a date to see metrics'
    else:
        time_difference = end_date_object - start_date_object

        time_difference_hours = time_difference.total_seconds() // 3600
        string_prefix = string_prefix + '| ' + '{}'.format(time_difference_hours) + 'hours' 
        return string_prefix

@app.callback(
    dash.dependencies.Output('aw-gantt-graph', 'figure'),
    [dash.dependencies.Input('my-date-picker-range', 'start_date'),
     dash.dependencies.Input('my-date-picker-range', 'end_date'),
     dash.dependencies.Input('input_range', 'value')])
def update_output(start_date, end_date, time_spent):
    if (start_date is not None) and (end_date is not None):
        start_date_string = datetime.fromisoformat(start_date)
        end_date_string = datetime.fromisoformat(end_date)

        time_spent_secs = 60 * 8 # default time spent 8mins
        if (time_spent is not None) and (type(time_spent) == int):
            time_spent_secs = 60 * time_spent
        
        return plot_period_activity(df, start_date_string, end_date_string, time_spent_secs)

@app.callback(
    dash.dependencies.Output('aw-duration_summary-chart', 'figure'),
    [dash.dependencies.Input('my-date-picker-range', 'start_date'),
     dash.dependencies.Input('my-date-picker-range', 'end_date'),
     dash.dependencies.Input('input_range', 'value')])
def update_output(start_date, end_date, time_spent):
    if (start_date is not None) and (end_date is not None):
        start_date_string = datetime.fromisoformat(start_date)
        end_date_string = datetime.fromisoformat(end_date)

        time_spent_secs = 60 * 8 # default time spent 8mins
        if (time_spent is not None) and (type(time_spent) == int):
            time_spent_secs = 60 * time_spent
        
        return plot_period_summary(df, start_date_string, end_date_string, time_spent_secs)

if __name__ == '__main__':
    app.run_server(debug=True)




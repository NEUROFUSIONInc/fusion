from __future__ import print_function
import datetime
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import pandas as pd

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


def get_credentials():
    """Connect to google calendar api
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    global service
    service = build('calendar', 'v3', credentials=creds)

    

def fetch_events(calendar_id):
    """Prints the start and name of the next 10 events on the user's calendar.

    daysago: number of days to look back rom
    """
    beginning_time = "2021-01-01T00:00:00.356167Z"
    now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time

    page_count = 0
    events_list = []

    print('Getting all of the past events')

    events = service.events()
    request = events.list(
        calendarId = calendar_id, # defailt 'primary'
        timeMin=beginning_time,
        timeMax=now,
        maxResults=2500,
        singleEvents=True,
        # showDeleted=True,
        orderBy='updated')

    while request is not None:
        
        page_count = page_count + 1
        print("Getting " + str(page_count) + " page of events...")
        eventsResult = request.execute()

        # Do something with the activities
        print(len(eventsResult.get('items', [])))
        events_list = events_list + list(eventsResult.get('items', []))

        request = events.list_next(request, eventsResult)
    
    return events_list
    
def write_events_to_csv(calendar_id, events_list):
    event_df = pd.DataFrame(events_list)
    filename = "data.csv"
    filepath = filename
    print("Creating CSV at " + filepath)
    event_df.to_csv(filepath, index=False)

if __name__ == '__main__':
    get_credentials()
    events_list = fetch_events("primary")
    write_events_to_csv("primary", events_list)
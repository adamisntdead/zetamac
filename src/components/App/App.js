import React, { Component } from "react";

import readingTime from "reading-time";

import { MuiThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter } from "react-router-dom";

import { CssBaseline, Button, Snackbar } from "@material-ui/core";

import { auth, firestore } from "../../firebase";
import authentication from "../../services/authentication";
import appearance from "../../services/appearance";

import ErrorBoundary from "../ErrorBoundary";
import LaunchScreen from "../LaunchScreen";
import Bar from "../Bar";
import Router from "../Router";
import DialogHost from "../DialogHost";

const initialState = {
  ready: false,
  performingAction: false,
  theme: appearance.defaultTheme,
  user: null,
  userData: null,
  roles: [],

  signUpDialog: {
    open: false,
  },

  signInDialog: {
    open: false,
  },

  settingsDialog: {
    open: false,
  },

  deleteAccountDialog: {
    open: false,
  },

  signOutDialog: {
    open: false,
  },

  noUsernameDialog: {
    open: false
  },

  customGameDialog: {
    open: false
  },

  snackbar: {
    autoHideDuration: 0,
    message: "",
    open: false,
  },
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  resetState = (callback) => {
    this.setState(
      {
        ready: true,
        theme: appearance.defaultTheme,
        user: null,
        userData: null,
        roles: [],
      },
      callback
    );
  };

  setTheme = (theme, callback) => {
    if (!theme) {
      this.setState(
        {
          theme: appearance.defaultTheme,
        },
        callback
      );

      return;
    }

    this.setState(
      {
        theme: appearance.createTheme(theme),
      },
      callback
    );
  };

  openDialog = (dialogId, callback) => {
    const dialog = this.state[dialogId];

    if (!dialog || dialog.open === undefined || null) {
      return;
    }

    dialog.open = true;

    this.setState({ dialog }, callback);
  };

  closeDialog = (dialogId, callback) => {
    const dialog = this.state[dialogId];

    if (!dialog || dialog.open === undefined || null) {
      return;
    }

    dialog.open = false;

    this.setState({ dialog }, callback);
  };

  closeAllDialogs = (callback) => {
    this.setState(
      {
        signUpDialog: {
          open: false,
        },

        signInDialog: {
          open: false,
        },

        settingsDialog: {
          open: false,
        },

        deleteAccountDialog: {
          open: false,
        },

        signOutDialog: {
          open: false,
        },

        noUsernameDialog: {
          open: false
        },

        customGameDialog: {
          open: false
        }
      },
      callback
    );
  };

  deleteAccount = () => {
    this.setState(
      {
        performingAction: true,
      },
      () => {
        authentication
          .deleteAccount()
          .then(() => {
            this.closeAllDialogs(() => {
              this.openSnackbar("Deleted account");
            });
          })
          .catch((reason) => {
            const code = reason.code;
            const message = reason.message;

            switch (code) {
              default:
                this.openSnackbar(message);
                return;
            }
          })
          .finally(() => {
            this.setState({
              performingAction: false,
            });
          });
      }
    );
  };

  openSettings = () => {
    this.setState({
      performingAction: true
    }, () => {
      this.setState({
        settingsDialog: {
          open: true,
        },
        noUsernameDialog: {
          open: false
        },
        customGameDialog: {
          open: false,
        },
        performingAction: false
      })
    })
  }

  signOut = () => {
    this.setState(
      {
        performingAction: true,
      },
      () => {
        authentication
          .signOut()
          .then(() => {
            this.closeAllDialogs(() => {
              this.openSnackbar("Signed out");
            });
          })
          .catch((reason) => {
            const code = reason.code;
            const message = reason.message;

            switch (code) {
              default:
                this.openSnackbar(message);
                return;
            }
          })
          .finally(() => {
            this.setState({
              performingAction: false,
            });
          });
      }
    );
  };

  openSnackbar = (message, autoHideDuration = 2, callback) => {
    this.setState(
      {
        snackbar: {
          autoHideDuration: readingTime(message).time * autoHideDuration,
          message,
          open: true,
        },
      },
      () => {
        if (callback && typeof callback === "function") {
          callback();
        }
      }
    );
  };

  closeSnackbar = (clearMessage = false) => {
    const { snackbar } = this.state;

    this.setState({
      snackbar: {
        message: clearMessage ? "" : snackbar.message,
        open: false,
      },
    });
  };

  render() {
    const { ready, performingAction, theme, user, userData, roles } =
      this.state;

    const {
      signUpDialog,
      signInDialog,
      settingsDialog,
      deleteAccountDialog,
      signOutDialog,
      noUsernameDialog,
      customGameDialog
    } = this.state;

    const { snackbar } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />

        <ErrorBoundary>
          {!ready && <LaunchScreen />}

          {ready && (
            <>
              <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
                <Router
                  user={user}
                  userData={userData}
                  roles={roles}
                  theme={theme}
                  bar={
                    <Bar
                      performingAction={performingAction}
                      theme={theme}
                      user={user}
                      userData={userData}
                      roles={roles}
                      onSignUpClick={() => this.openDialog("signUpDialog")}
                      onSignInClick={() => this.openDialog("signInDialog")}
                      onSettingsClick={() => this.openDialog("settingsDialog")}
                      onSignOutClick={() => this.openDialog("signOutDialog")}
                    />
                  }
                  openSnackbar={this.openSnackbar}
                  openDialog={this.openDialog}
                />

                <DialogHost
                  performingAction={performingAction}
                  theme={theme}
                  user={user}
                  userData={userData}
                  openSnackbar={this.openSnackbar}
                  dialogs={{
                    signUpDialog: {
                      dialogProps: {
                        open: signUpDialog.open,

                        onClose: (callback) => {
                          this.closeDialog("signUpDialog");

                          if (callback && typeof callback === "function") {
                            callback();
                          }
                        },
                      },
                    },

                    signInDialog: {
                      dialogProps: {
                        open: signInDialog.open,

                        onClose: (callback) => {
                          this.closeDialog("signInDialog");

                          if (callback && typeof callback === "function") {
                            callback();
                          }
                        },
                      },
                    },

                    settingsDialog: {
                      dialogProps: {
                        open: settingsDialog.open,

                        onClose: () => this.closeDialog("settingsDialog"),
                      },

                      props: {
                        onDeleteAccountClick: () =>
                          this.openDialog("deleteAccountDialog"),
                      },
                    },

                    deleteAccountDialog: {
                      dialogProps: {
                        open: deleteAccountDialog.open,

                        onClose: () => this.closeDialog("deleteAccountDialog"),
                      },

                      props: {
                        deleteAccount: this.deleteAccount,
                      },
                    },

                    signOutDialog: {
                      dialogProps: {
                        open: signOutDialog.open,

                        onClose: () => this.closeDialog("signOutDialog"),
                      },

                      props: {
                        title: "Sign out?",
                        contentText:
                          "While signed out you will not be able to track your scores over time.",
                        dismissiveAction: (
                          <Button
                            color="primary"
                            onClick={() => this.closeDialog("signOutDialog")}
                          >
                            Cancel
                          </Button>
                        ),
                        confirmingAction: (
                          <Button
                            color="primary"
                            disabled={performingAction}
                            variant="contained"
                            onClick={this.signOut}
                          >
                            Sign Out
                          </Button>
                        ),
                      },
                    },

                    noUsernameDialog: {
                      dialogProps: {
                        open: noUsernameDialog.open,

                        onClose: () => this.closeDialog('noUsernameDialog'),
                      },

                      props: {
                        title: "Missing username!",
                        contentText: "You haven't set your username yet! This means you won't be able to play the game or track your scores.",
                        confirmingAction: (
                          <Button color="primary"
                            disabled={performingAction}
                            variant="contained"
                            onClick={this.openSettings}>Open Settings</Button>
                        )
                      }
                    },

                    customGameDialog: {
                      dialogProps: {
                        open: customGameDialog.open,
                        onClose: () => this.closeDialog('customGameDialog'),
                      },


                      props: {
                        title: 'Custom Game!',
                        contentText: 'Begin a custom game',
                        dismissiveAction: (
                          <Button
                            color="primary"
                            onClick={() => this.closeDialog("customGameDialog")}
                          >
                            Cancel
                          </Button>
                        ),
                        confirmingAction: (
                          <Button color="primary"
                            disabled={performingAction}
                            variant="contained"
                            onClick={this.openSettings}>Begin Game</Button>
                        )
                      }
                    }
                  }}
                />

                <Snackbar
                  autoHideDuration={snackbar.autoHideDuration}
                  message={snackbar.message}
                  open={snackbar.open}
                  onClose={this.closeSnackbar}
                />
              </BrowserRouter>
            </>
          )}
        </ErrorBoundary>
      </MuiThemeProvider>
    );
  }

  componentDidMount() {
    this.onAuthStateChangedObserver = auth.onAuthStateChanged(
      (user) => {
        // The user is not signed in or doesn’t have a user ID.
        if (!user || !user.uid) {
          if (this.userDocumentSnapshotListener) {
            this.userDocumentSnapshotListener();
          }

          this.resetState();

          return;
        }

        // The user is signed in, begin retrieval of external user data.
        this.userDocumentSnapshotListener = firestore
          .collection("users")
          .doc(user.uid)
          .onSnapshot(
            (snapshot) => {
              const data = snapshot.data();

              // The user doesn’t have a data point, equivalent to not signed in.
              if (!snapshot.exists || !data) {
                return;
              }

              authentication
                .getRoles()
                .then((value) => {
                  this.setTheme(data.theme, () => {
                    this.setState({
                      ready: true,
                      user: user,
                      userData: data,
                      roles: value || [],
                    });
                  });
                })
                .catch((reason) => {
                  this.resetState(() => {
                    const code = reason.code;
                    const message = reason.message;

                    switch (code) {
                      default:
                        this.openSnackbar(message);
                        return;
                    }
                  });
                });
            },
            (error) => {
              this.resetState(() => {
                const code = error.code;
                const message = error.message;

                switch (code) {
                  default:
                    this.openSnackbar(message);
                    return;
                }
              });
            }
          );
      },
      (error) => {
        this.resetState(() => {
          const code = error.code;
          const message = error.message;

          switch (code) {
            default:
              this.openSnackbar(message);
              return;
          }
        });
      }
    );
  }

  componentWillUnmount() {
    if (this.onAuthStateChangedObserver) {
      this.onAuthStateChangedObserver();
    }

    if (this.userDocumentSnapshotListener) {
      this.userDocumentSnapshotListener();
    }
  }
}

export default App;
